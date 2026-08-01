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
