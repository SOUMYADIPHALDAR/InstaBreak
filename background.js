chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === "complete" && tab.url && tab.url.includes("instagram.com/")){
        chrome.tabs.sendMessage(tabId, {
            type: "NEW"
            },
            () => {
                const err = chrome.runtime.lastError;
                if(err){
                    console.log("Failed to send message from background page.", err.message);
                }
            }
        )
    }
});