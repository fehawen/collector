import process from 'node:process'

import { createRun } from './run.js'
import {
    closeBrowser,
    launchBrowser,
    createPage,
    navigate,
    observePage
} from './browser.js'
import {
    discoverPages,
    discoverResources
} from './discover.js'
import {
    preserveArtifact,
    recordArtifact
} from './artifacts.js'
import { recordObservation } from './observations.js'
import { createQueue } from './queue.js'
import { createPages } from './pages.js'

const COLLECTOR_VERSION = '0.1.0'

async function main() {
    const target = parseArguments()

    printBanner()

    const run = await createRun(target)
    const browser = await launchBrowser()

    try {
        const page = await createPage(browser)
        const queue = createQueue()
        const pages = createPages()

        queue.add({
            type: 'page',
            url: target
        })

        let discovery

        while ((discovery = queue.next()) !== null) {
            if (discovery.type === 'page') {
                if (pages.has(discovery.url)) {
                    continue
                }

                pages.add(discovery.url)

                const result = await navigate(page, discovery.url)

                if (result.type === 'download') {
                    const artifact = await preserveArtifact(run, result)
                    await recordArtifact(run, artifact)
                    continue
                }

                const observation = await observePage(page)
                await recordObservation(run, observation)

                const resources = await discoverResources(page)

                const targetOrigin = new URL(target).origin
                const pageDiscoveries = await discoverPages(page, targetOrigin)

                for (const resource of resources) {
                    queue.add(resource)
                }

                for (const pageDiscovery of pageDiscoveries) {
                    if (pageDiscovery.type === 'page') {
                        queue.add(pageDiscovery)
                    }
                }
            }

            if (discovery.type === 'script') {
                const artifact = await preserveArtifact(run, discovery)
                await recordArtifact(run, artifact)
            }
        }
    }
    finally {
        await closeBrowser(browser)
    }

    printRun(run)
}

function parseArguments() {
    const target = process.argv[2]

    if (!target) {
        usage()
        process.exit(1)
    }

    return target
}

function printBanner() {
    console.log(`collector ${COLLECTOR_VERSION}`)
    console.log()
}

function printRun(run) {
    console.log(`Run ID : ${run.id}`)
    console.log(`Target : ${run.target}`)
    console.log(`Output : ${run.directory}`)
}

function usage() {
    console.error('Usage: collector <url>')
}

try {
    await main()
} catch (error) {
    console.error(error.message)
    process.exit(3)
}
