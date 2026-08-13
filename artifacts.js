import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function preserveArtifact(run, discovery) {
    if (discovery.type !== 'script') {
        throw new Error(`Unsupported artifact type: ${discovery.type}`)
    }

    const response = await fetch(discovery.url)

    if (!response.ok) {
        throw new Error(
            `Failed to fetch ${discovery.url}: ${response.status} ${response.statusText}`
        )
    }

    const content = Buffer.from(await response.arrayBuffer())

    const sha256 = createHash('sha256')
        .update(content)
        .digest('hex')

    const relativePath = path.join(
        'artifacts',
        'script',
        `${sha256}.js`
    )

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
