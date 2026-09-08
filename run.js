import path from 'node:path'
import fs from 'node:fs/promises'
import { timestamp, writeJson } from './util.js'

const VERSION = 1
const COLLECTOR_VERSION = '0.1.0'

export async function createRun(targets, output) {
    const id = runId()
    const started = timestamp()
    const directory = path.join(output ?? '.', 'runs', id)

    const run = {
        id,
        targets,
        directory,
        started
    }

    await fs.mkdir(directory, { recursive: true })
    await writeJson(
        path.join(directory, 'manifest.json'),
        {
            version: VERSION,
            collector: COLLECTOR_VERSION,
            run_id: run.id,
            targets: run.targets,
            started: run.started
        }
    )

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
