import path from 'node:path'
import { createHash } from 'node:crypto'
import {
    access,
    mkdir,
    writeFile
} from 'node:fs/promises'
import { appendJsonLine } from './util.js'

function extensionFor(response) {
    switch (response.type) {
        case 'script':
            return '.js'
        case 'stylesheet':
            return '.css'
        case 'download':
            return path.extname(response.filename).toLowerCase()
        default:
            return undefined
    }
}

export async function preserveArtifact(run, response) {
    const extension = extensionFor(response)

    if (extension === undefined) {
        console.error(`Skipping unsupported artifact type: ${response.type}`)
        return undefined
    }

    const sha256 = createHash('sha256')
        .update(response.body)
        .digest('hex')

    const relativePath = path.join(
        'artifacts',
        response.type,
        `${sha256}${extension}`
    )

    const file = path.join(run.directory, relativePath)
    await mkdir(path.dirname(file), { recursive: true })

    try {
        await access(file)
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error
        }

        await writeFile(file, response.body)
    }

    const artifact = {
        version: 1,
        type: response.type,
        url: response.url,
        sha256,
        path: relativePath
    }

    if (response.type === 'download') {
        artifact.filename = response.filename
    }

    return artifact
}

export async function recordArtifact(run, artifact) {
    const file = path.join(run.directory, 'artifacts.jsonl')
    await appendJsonLine(file, artifact)
}
