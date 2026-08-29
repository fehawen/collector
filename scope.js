export function isInScope(url, target) {
    const hostname = new URL(url).hostname
    const targetHostname = new URL(target).hostname

    return (
        hostname === targetHostname ||
        hostname.endsWith(`.${targetHostname}`)
    )
}
