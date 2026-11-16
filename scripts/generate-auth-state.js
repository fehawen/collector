import { chromium } from 'playwright'
import { chmod, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const [targetUrl, outputArg] = process.argv.slice(2)

if (!targetUrl) {
    console.error('Usage: yarn generate-auth-state <url> [output-file]')
    process.exit(1)
}

let url

try {
    url = new URL(targetUrl)

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL must use HTTP or HTTPS')
    }
} catch (error) {
    console.error(`error: ${error.message}`)
    process.exit(1)
}

const outputPath = resolve(outputArg ?? 'auth-state.json')
const rl = createInterface({ input: stdin, output: stdout })

let browser

try {
    browser = await chromium.launch({
        headless: false,
        args: ["--disable-gpu"]
    })

    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(url.href, {
        waitUntil: 'domcontentloaded'
    })

    console.log('Log in using the browser window.')
    console.log('Complete any required authentication steps.')
    console.log('Navigate to an authenticated page in the same tab.')

    await rl.question(
        '\nPress Enter when authentication is complete...'
    )

    const currentUrl = new URL(page.url())

    if (!['http:', 'https:'].includes(currentUrl.protocol)) {
        throw new Error(
            'The current page does not have an HTTP or HTTPS origin'
        )
    }

    const sessionStorage = await page.evaluate(() => {
        const entries = []

        for (let i = 0; i < window.sessionStorage.length; i++) {
            const key = window.sessionStorage.key(i)

            if (key !== null) {
                entries.push([
                    key,
                    window.sessionStorage.getItem(key)
                ])
            }
        }

        return Object.fromEntries(entries)
    })

    const state = await context.storageState()

    state.sessionStorage = {
        [currentUrl.origin]: sessionStorage
    }

    await writeFile(
        outputPath,
        `${JSON.stringify(state, null, 2)}\n`,
        { mode: 0o600 }
    )

    await chmod(outputPath, 0o600)

    console.log(`\nAuthentication state saved to ${outputPath}`)
    console.log(`Session storage captured for ${currentUrl.origin}`)
} catch (error) {
    console.error(`error: ${error.message}`)
    process.exitCode = 1
} finally {
    rl.close()

    if (browser) {
        await browser.close()
    }
}
