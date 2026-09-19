export async function discoverPages(page) {
    const urls = await page.$$eval(
        'a[href]',
        (elements) => elements.map((element) => {
            const url = new URL(element.href)

            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return null
            }

            url.hash = ''

            return url.href
        }).filter(Boolean)
    )

    return urls
}
