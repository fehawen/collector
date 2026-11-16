
import fs from 'node:fs/promises'

export async function loadAuthState(file) {
    if (file === undefined) {
        return undefined
    }

    let state

    try {
        const content = await fs.readFile(file, 'utf8')
        state = JSON.parse(content)
    } catch (error) {
        throw new Error(
            `Unable to load authentication state: ${error.message}`
        )
    }

    if (
        state === null ||
        typeof state !== 'object' ||
        Array.isArray(state)
    ) {
        throw new Error(
            'Invalid authentication state: root must be an object'
        )
    }

    const sessionStorage = state.sessionStorage ?? {}

    if (
        sessionStorage === null ||
        typeof sessionStorage !== 'object' ||
        Array.isArray(sessionStorage)
    ) {
        throw new Error(
            'Invalid authentication state: sessionStorage must be an object'
        )
    }

    for (const [origin, entries] of Object.entries(sessionStorage)) {
        let url

        try {
            url = new URL(origin)
        } catch {
            throw new Error(
                `Invalid authentication state: invalid sessionStorage origin: ${origin}`
            )
        }

        if (
            !['http:', 'https:'].includes(url.protocol) ||
            url.origin !== origin
        ) {
            throw new Error(
                `Invalid authentication state: invalid sessionStorage origin: ${origin}`
            )
        }

        if (
            entries === null ||
            typeof entries !== 'object' ||
            Array.isArray(entries)
        ) {
            throw new Error(
                `Invalid authentication state: sessionStorage entries for ${origin} must be an object`
            )
        }

        for (const [key, value] of Object.entries(entries)) {
            if (typeof value !== 'string') {
                throw new Error(
                    `Invalid authentication state: sessionStorage value for ${key} must be a string`
                )
            }
        }
    }

    const { sessionStorage: _, ...storageState } = state

    return {
        storageState,
        sessionStorage
    }
}
