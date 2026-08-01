import fs from 'node:fs/promises'
import path from 'node:path'

export function timestamp() {
    return new Date().toISOString()
}

export async function writeJson(path, value) {
    const json = JSON.stringify(value, null, 4)
    await fs.writeFile(path, json + '\n', 'utf8')
}

export async function appendJsonLine(file, value) {
    await fs.mkdir(path.dirname(file), { recursive: true })

    await fs.appendFile(
        file,
        JSON.stringify(value) + '\n'
    )
}
