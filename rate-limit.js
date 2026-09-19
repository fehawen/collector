export function createRateLimiter(rate) {
    if (rate === undefined) {
        return {
            async wait() {}
        }
    }

    let tokens = rate
    let last = Date.now()

    return {
        async wait() {
            while (true) {
                const now = Date.now()
                const elapsed = (now - last) / 1000

                tokens = Math.min(
                    rate,
                    tokens + elapsed * rate
                )

                last = now

                if (tokens >= 1) {
                    tokens -= 1
                    return
                }

                const wait = (1 - tokens) / rate * 1000

                await sleep(wait)
            }
        }
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    })
}
