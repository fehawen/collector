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
    await page.goto(url)
}
