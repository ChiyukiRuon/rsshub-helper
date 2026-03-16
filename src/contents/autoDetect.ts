import { domReady } from "~lib/domReady";
import { generateRSS } from "~lib/rsshub";
import { getSettings } from "~lib/storageCache";
import { throttle } from "~lib/throttle";

export const config = {
    matches: ["<all_urls>"],
    run_at: "document_idle"
}

let lastUrl = ""

async function detectRSS() {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (location.href === lastUrl) return
    lastUrl = location.href

    const { autoDetect, autoCopy, rules } = await getSettings()

    if (!autoDetect) return

    const rss = generateRSS(location.href, rules).rss

    if (!rss) return

    console.log("RSSHub detected:", rss)

    if (autoCopy) {
        try {
            await navigator.clipboard.writeText(rss)
            console.log("RSSHub copied:", rss)
        } catch (e) {
            console.warn("clipboard failed", e)
        }
    }
}

const run = throttle(detectRSS, 1500) // 节流时间稍微拉长一点

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "URL_CHANGED") {
        run()
    }
})

domReady().then(run)
