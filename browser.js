import { chromium } from 'playwright'

export async function launchBrowser() {
    return await chromium.launch({
        headless: true,
    })
}

export async function closeBrowser(browser) {
    await browser.close()
}
