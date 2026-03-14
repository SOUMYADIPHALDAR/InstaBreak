let scrollBlocked = false;

chrome.storage.local.get(["scrollBlocked"], (result) => {
    if(result.scrollBlocked){
        scrollBlocked = true;
        disableScrolling();
    }
})

function blockScroll(e){
    if(scrollBlocked){
        e.preventDefault();
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if(message.type === "STOP_SCROLL"){
        scrollBlocked = message.enabled;

        if(scrollBlocked){
            disableScrolling()
        } else {
            window.removeEventListener("wheel", blockScroll);
            window.removeEventListener("touchmove", blockScroll);
            window.removeEventListener("keydown", blockScroll);
        }
    }
});

function disableScrolling(){
    window.addEventListener("wheel", blockScroll, {passive: false});
    window.addEventListener("touchmove", blockScroll, {passive: false});
    window.addEventListener("keydown", blockScroll, {passive: false});
}