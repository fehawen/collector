import path from 'node:path'

import { appendJsonLine } from './util.js'

export async function recordObservation(run, observation) {
    const file = path.join(run.directory, 'observations.jsonl')
    await appendJsonLine(file, record(observation))
}

function record(observation) {
    return {
        version: 1,
        url: observation.url,
        title: observation.title,
        html: observation.html
    }
}
