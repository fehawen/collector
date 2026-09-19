import process from 'node:process'

import { loadConfig } from './config.js'
import { createRun } from './run.js'
import {
    closeBrowser,
    launchBrowser,
    createPage,
    navigate,
    observePage
} from './browser.js'
import { discoverPages } from './discover.js'
import {
    preserveArtifact,
    recordArtifact
} from './artifacts.js'
import { recordObservation } from './observations.js'
import { createQueue } from './queue.js'
import { createPages } from './pages.js'
import { createScope } from './scope.js'

const COLLECTOR_VERSION = '0.1.0'

async function main() {
    const options = parseArguments()
    const config = await loadConfig(options.config)

    printBanner()

    const run = await createRun(config.targets, options.output)
    const browser = await launchBrowser()

    try {
        const page = await createPage(browser)
        const queue = createQueue()
        const pages = createPages()

        const scope = createScope(config.scope)

        for (const target of run.targets) {
            if (scope.isAllowed(target)) {
                queue.add({
                    type: 'page',
                    url: target
                })
            }
        }

        let discovery

        while (true) {
            discovery = queue.next()

            if (discovery === null) {
                break
            }

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

                for (const response of result.responses) {
                    const artifact = await preserveArtifact(run, response)
                    await recordArtifact(run, artifact)
                }

                const observation = await observePage(page)
                await recordObservation(run, observation)

                const pageDiscoveries = await discoverPages(page)

                for (const pageDiscovery of pageDiscoveries) {
                    if (scope.isAllowed(pageDiscovery)) {
                        queue.add({
                            type: 'page',
                            url: pageDiscovery
                        })
                    }
                }
            }

            if (discovery.type === 'script' || discovery.type === 'stylesheet') {
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
    const args = process.argv.slice(2)

    if (
        args.length < 2 ||
        args[0] !== '--config'
    ) {
        usage()
        process.exit(1)
    }

    const config = args[1]
    let output

    if (args.length === 4) {
        if (args[2] !== '--output') {
            usage()
            process.exit(1)
        }

        output = args[3]
    } else if (args.length !== 2) {
        usage()
        process.exit(1)
    }

    return {
        config,
        output
    }
}

function printBanner() {
    console.log(`collector ${COLLECTOR_VERSION}`)
    console.log()
}

function printRun(run) {
    console.log(`Run ID  : ${run.id}`)
    console.log(`Output  : ${run.directory}`)
    console.log('Targets :')
    for (const target of run.targets) {
        console.log(`  ${target}`)
    }
}

function usage() {
    console.error('Usage: collector --config <file> [--output <directory>]')
}

try {
    await main()
} catch (error) {
    console.error(error.message)
    process.exit(3)
}
