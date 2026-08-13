export function createQueue() {
    const items = []
    let position = 0

    return {
        add(discovery) {
            items.push(discovery)
        },

        next() {
            if (position >= items.length) {
                return null
            }

            return items[position++]
        }
    }
}
