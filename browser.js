import { chromium } from 'playwright'

export async function launchBrowser() {
    return await chromium.launch({
        headless: true,
    })
}

export async function createPage(context) {
    return await context.newPage()
}

export async function createContext(browser, headers = {}) {
    return await browser.newContext({
        extraHTTPHeaders: headers
    })
}

export async function navigate(page, url) {
    const responses = []
    const responsePromises = []

    const responseHandler = (response) => {
        const type = response.request().resourceType()

        const promise = (async () => {
            const headers = await response.allHeaders()

            const result = {
                type,
                url: response.url(),
                headers
            }

            if (type === 'script' || type === 'stylesheet') {
                result.body = await response.body()
            }

            responses.push(result)
        })()

        responsePromises.push(promise)
    }

    let downloadResolve

    const downloadPromise = new Promise((resolve) => {
        downloadResolve = resolve
    })

    const downloadHandler = (download) => {
        downloadResolve(download)
    }

    page.on('response', responseHandler)
    page.on('download', downloadHandler)

    let navigationError
    let download

    try {
        try {
            await page.goto(url)
        } catch (error) {
            if (isDownloadError(error)) {
                download = await downloadPromise
            } else {
                navigationError = error
            }
        }

        try {
            await Promise.all(responsePromises)
        } catch (error) {
            if (!navigationError) {
                navigationError = error
            }
        }
    } finally {
        page.off('response', responseHandler)
        page.off('download', downloadHandler)
    }

    if (download) {
        const stream = await download.createReadStream()
        const body = await readStream(stream)

        return {
            type: 'download',
            url,
            filename: download.suggestedFilename(),
            body
        }
    }

    if (navigationError) {
        throw navigationError
    }

    return {
        type: 'page',
        responses
    }
}

function isDownloadError(error) {
    return error instanceof Error &&
        error.message.includes('Download is starting')
}

export async function observePage(page) {
    return {
        url: page.url(),
        title: await page.title(),
        html: await page.content()
    }
}

async function readStream(stream) {
    const chunks = []

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}
