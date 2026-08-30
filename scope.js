export function isInScope(url, target) {
    const hostname = new URL(url).hostname
    const targetHostname = new URL(target).hostname

    return (
        hostname === targetHostname ||
        hostname.endsWith(`.${targetHostname}`)
    )
}

export function createScope({ include = [], exclude = [] }) {
    function match(hostname, pattern) {
        if (pattern.startsWith('*.')) {
            const suffix = pattern.slice(2)

            if (
                hostname.endsWith(`.${suffix}`) &&
                hostname !== suffix
            ) {
                return 1
            }

            return 0
        }

        return hostname === pattern ? 2 : 0
    }

    return {
        isAllowed(url) {
            const hostname = new URL(url).hostname

            let includeSpecificity = 0
            let excludeSpecificity = 0

            for (const pattern of include) {
                includeSpecificity = Math.max(
                    includeSpecificity,
                    match(hostname, pattern)
                )
            }

            for (const pattern of exclude) {
                excludeSpecificity = Math.max(
                    excludeSpecificity,
                    match(hostname, pattern)
                )
            }

            if (includeSpecificity === 0) {
                return false
            }

            return includeSpecificity > excludeSpecificity
        }
    }
}

