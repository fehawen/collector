import fs from 'node:fs/promises'

export async function loadConfig(file) {
    const content = await fs.readFile(file, 'utf8')
    return JSON.parse(content)
}
