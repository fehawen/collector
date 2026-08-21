import { chromium } from 'playwright'

export async function launchBrowser() {
    return await chromium.launch({
        headless: true,
    })
}

export async function closeBrowser(browser) {
    await browser.close()
}

export async function createPage(browser) {
    return await browser.newPage()
}

export async function navigate(page, url) {
    const downloadPromise = page.waitForEvent('download', {
        timeout: 1000
    }).catch(() => null)

    let navigationError

    try {
        await page.goto(url)
    }
    catch (error) {
        navigationError = error
    }

    const download = await downloadPromise

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
        type: 'page'
    }
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
