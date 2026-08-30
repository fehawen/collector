export function createConfig(target) {
    return {
        scope: {
            include: [
                new URL(target).hostname
            ],
            exclude: []
        }
    }
}
