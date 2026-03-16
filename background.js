chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === "complete" && tab.url && tab.url.includes("instagram.com/")){
        chrome.tabs.sendMessage(
            tabId,
            { type: "NEW" },
            () => void chrome.runtime.lastError
        );
    }
});