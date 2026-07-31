import fs from 'node:fs/promises'

export function timestamp() {
    return new Date().toISOString()
}

export async function mkdir(path) {
    await fs.mkdir(path, { recursive: true })
}

export async function writeJson(path, value) {
    const json = JSON.stringify(value, null, 4)
    await fs.writeFile(path, json + '\n', 'utf8')
}
