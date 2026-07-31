import path from 'node:path'
import { mkdir, timestamp, writeJson } from './util.js'

const VERSION = 1
const COLLECTOR_VERSION = '0.1.0'

export async function createRun(target) {
    const id = runId()
    const started = timestamp()
    const directory = path.join('runs', id)

    const run = {
        id,
        target,
        directory,
        started
    }

    await mkdir(directory)
    await writeJson(path.join(directory, 'manifest.json'), manifest(run))

    return run
}

function runId() {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')

    return `${year}${month}${day}-${hour}${minute}${second}`
}

function manifest(run) {
    return {
        version: VERSION,
        collector: COLLECTOR_VERSION,
        run_id: run.id,
        target: run.target,
        started: run.started
    }
}
