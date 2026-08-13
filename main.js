import process from 'node:process'

import { createRun } from './run.js'
import {
    closeBrowser,
    launchBrowser,
    createPage,
    navigate,
    observePage
} from './browser.js'
import { recordObservation } from './observations.js'
import { discoverResources } from './discover.js'
import { createQueue } from './queue.js'
import { preserveArtifact, recordArtifact } from './artifacts.js'

const COLLECTOR_VERSION = '0.1.0'

async function main() {
    const target = parseArguments()

    printBanner()

    const run = await createRun(target)
    const browser = await launchBrowser()

    try {
        const page = await createPage(browser)
        await navigate(page, target)

        const observation = await observePage(page)
        await recordObservation(run, observation)

        const queue = createQueue()

        const discoveries = await discoverResources(page)
        for (const discovery of discoveries) {
            if (discovery.type !== 'script') {
                continue
            }

            queue.add(discovery)
        }

        let discovery
        while ((discovery = queue.next()) !== null) {
            const artifact = await preserveArtifact(run, discovery)
            await recordArtifact(run, artifact)
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
