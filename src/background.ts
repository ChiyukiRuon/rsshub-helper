chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId === 0) {
        console.log("检测到历史状态变化:", details.url)

        chrome.tabs
            .sendMessage(details.tabId, {
                type: "URL_CHANGED",
                url: details.url
            })
    }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.tabs
            .sendMessage(tabId, {
                type: "URL_CHANGED",
                url: tab.url
            })
    }
})
