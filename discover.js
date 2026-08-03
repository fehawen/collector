const DISCOVERY_RULES = [
    {
        type: "script",
        selector: "script[src]",
        property: "src"
    },
    {
        type: "stylesheet",
        selector: 'link[rel="stylesheet"]',
        property: "href"
    }
]

export async function discoverResources(page) {
    const discoveries = []

    for (const rule of DISCOVERY_RULES) {
        const found = await page.$$eval(
            rule.selector,
            (elements, { type, property }) => {
                return elements.map(element => ({
                    type,
                    url: element[property]
                }))
            },
            {
                type: rule.type,
                property: rule.property
            }
        )

        discoveries.push(...found)
    }

    return discoveries
}
