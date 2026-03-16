import { getAutoCopyPage, getAutoDetect, getRules } from "~lib/storage"

let cache: {
    autoDetect?: boolean
    autoCopy?: boolean
    rules?: any
} = {}

export async function getSettings() {
    if (!cache.rules) {
        const [autoDetect, autoCopy, rules] = await Promise.all([
            getAutoDetect(),
            getAutoCopyPage(),
            getRules()
        ])

        cache = {
            autoDetect,
            autoCopy,
            rules
        }
    }

    return cache
}
