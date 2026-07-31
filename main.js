import process from 'node:process'

import { createRun } from './run.js'

const COLLECTOR_VERSION = '0.1.0'

async function main() {
    const target = parseArguments()

    printBanner()

    const run = await createRun(target)

    printRun(run)
}

function parseArguments() {
    const [, , target] = process.argv

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
