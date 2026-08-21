export function createPages() {
    const urls = new Set()

    return {
        has(url) {
            return urls.has(url)
        },
        add(url) {
            urls.add(url)
        }
    }
}
