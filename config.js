import fs from 'node:fs/promises'

export async function loadConfig(file) {
    const content = await fs.readFile(file, 'utf8')
    const config = JSON.parse(content)

    validateConfig(config)

    return config
}

function validateConfig(config) {
    if (config === null || typeof config !== 'object') {
        throw new Error('Invalid configuration: root must be an object')
    }

    if (config.version !== 1) {
        throw new Error('Invalid configuration: version must be 1')
    }

    if (!Array.isArray(config.targets) || config.targets.length === 0) {
        throw new Error(
            'Invalid configuration: targets must be a non-empty array'
        )
    }

    for (const target of config.targets) {
        validateTarget(target)
    }

    if (config.scope === null || typeof config.scope !== 'object') {
        throw new Error(
            'Invalid configuration: scope must be an object'
        )
    }

    validatePatterns(config.scope.include, 'scope.include', true)
    validatePatterns(config.scope.exclude, 'scope.exclude', false)
}

function validateTarget(target) {
    if (typeof target !== 'string') {
        throw new Error(
            'Invalid configuration: targets must contain strings'
        )
    }

    let url

    try {
        url = new URL(target)
    }
    catch {
        throw new Error(
            `Invalid configuration: target is not a valid URL: ${target}`
        )
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(
            `Invalid configuration: target must use HTTP or HTTPS: ${target}`
        )
    }
}

function validatePatterns(patterns, name, required) {
    if (!Array.isArray(patterns)) {
        throw new Error(
            `Invalid configuration: ${name} must be an array`
        )
    }

    if (required && patterns.length === 0) {
        throw new Error(
            `Invalid configuration: ${name} must not be empty`
        )
    }

    for (const pattern of patterns) {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            throw new Error(
                `Invalid configuration: ${name} contains an invalid entry`
            )
        }
    }
}
