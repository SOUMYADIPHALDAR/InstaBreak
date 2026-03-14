const toggleBtn = document.getElementById("toggle");

chrome.storage.local.get(["scrollBlocked"], (result) => {
    if(result.scrollBlocked){
        toggleBtn.checked = true;
    }else {
        toggleBtn.checked = false;
    }
});

toggleBtn.addEventListener("change", async() => {
    const toggle = toggleBtn.checked;

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.storage.local.set({
        scrollBlocked: toggle
    });

    chrome.tabs.sendMessage(tabs[0].id, {
        type: "STOP_SCROLL",
        enabled: toggle
    });
});