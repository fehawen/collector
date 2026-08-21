import path from 'node:path'
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { appendJsonLine } from './util.js'

export async function preserveArtifact(run, discovery) {
    let content

    if (discovery.type === 'script') {
        const response = await fetch(discovery.url)

        if (!response.ok) {
            throw new Error(
                `Failed to fetch ${discovery.url}: ${response.status} ${response.statusText}`
            )
        }

        content = Buffer.from(await response.arrayBuffer())
    }
    else if (discovery.type === 'download') {
        content = discovery.body
    }
    else {
        throw new Error(`Unsupported artifact type: ${discovery.type}`)
    }

    const sha256 = createHash('sha256')
        .update(content)
        .digest('hex')

    let relativePath

    if (discovery.type === 'script') {
        relativePath = path.join(
            'artifacts',
            'script',
            `${sha256}.js`
        )
    }
    else {
        const extension = path.extname(discovery.filename)

        relativePath = path.join(
            'artifacts',
            'download',
            `${sha256}${extension}`
        )
    }

    const file = path.join(run.directory, relativePath)

    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, content)

    return {
        version: 1,
        type: discovery.type,
        url: discovery.url,
        sha256,
        path: relativePath
    }
}

export async function recordArtifact(run, artifact) {
    const file = path.join(run.directory, 'artifacts.jsonl')
    await appendJsonLine(file, artifact)
}
