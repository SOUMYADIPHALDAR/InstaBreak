document.addEventListener("DOMContentLoaded", init);

function init(){
    setupEventListeners();
}

const toggleBtn = document.getElementById("toggle");

chrome.storage.local.get(["scrollBlocked", "timeLimit"], (result) => {
    if(result.scrollBlocked){
        toggleBtn.checked = true;
    }else {
        toggleBtn.checked = false;
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if(areaName !== "local") return;
    if(changes.scrollBlocked){
        toggleBtn.checked = !!changes.scrollBlocked.newValue;
    }
});

function setupEventListeners(){
    document.getElementById("saveTime").addEventListener("click", handleSaveTime);
}

async function handleSaveTime(){
    const timeLimit = document.getElementById("timeLimit").value;

    if(timeLimit < 0 || isNaN(timeLimit)){
        console.log("Please enter a valid time.");
        return;
    }

    // Save time limit and auto-enable blocking
    chrome.storage.local.set({
        timeLimit: timeLimit
    });

    await setScrollBlocked(true);
}

async function setScrollBlocked(enabled) {
    chrome.storage.local.set({
        scrollBlocked: enabled
    });

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tabs?.[0]?.id) return;

    chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "STOP_SCROLL", enabled },
        () => void chrome.runtime.lastError
    );
}