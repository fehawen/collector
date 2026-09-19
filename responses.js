import path from 'node:path'

import { appendJsonLine } from './util.js'

export async function recordResponse(run, response) {
    const file = path.join(run.directory, 'responses.jsonl')
    await appendJsonLine(file, record(response))
}

function record(response) {
    return {
        version: 1,
        type: response.type,
        url: response.url,
        headers: response.headers
    }
}
