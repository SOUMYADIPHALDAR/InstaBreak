let lockEndTime = 0;

document.addEventListener("DOMContentLoaded", init);

function init(){
    setupEventListeners();
}

const toggleBtn = document.getElementById("toggle");

chrome.storage.local.get(["scrollBlocked", "timeLimit", "lockEndTime"], (result) => {
    if(result.scrollBlocked){
        toggleBtn.checked = true;
        lockEndTime = result.lockEndTime;
        setInterval(() => handleTimeLeft(lockEndTime), 1000);
    }else {
        toggleBtn.checked = false;
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if(areaName !== "local") return;
    if(changes.scrollBlocked){
        toggleBtn.checked = !!changes.scrollBlocked.newValue;
    }
    if(changes.lockEndTime){
        lockEndTime = changes.lockEndTime.newValue;
        setInterval(() => handleTimeLeft(lockEndTime), 1000);
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
        { 
            type: "STOP_SCROLL",
            enabled
        },
        () => void chrome.runtime.lastError
    );
}

function handleTimeLeft(lockEndTime){
    const timeLeft = document.getElementById("timeLeft");

    if(!lockEndTime){
        timeLeft.textContent = "__:__";
        return;
    }

    const remainingTime = lockEndTime - Date.now();
    if(remainingTime <= 0){
        timeLeft.textContent = "00:00";
        return;
    }

    const totalSeconds = Math.floor(remainingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = String(minutes).padStart(2, "0")+":" + String(seconds).padStart(2, "0");
    timeLeft.textContent = formattedTime;
}