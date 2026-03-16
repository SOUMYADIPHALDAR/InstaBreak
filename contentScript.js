let scrollBlocked = false;
let tabOpenTime = 0;
let timeLimit = 0;
let timerId = null;

chrome.storage.local.get(["scrollBlocked", "timeLimit"], (result) => {
  if (result.scrollBlocked) {
    scrollBlocked = true;
    disableScrolling();
  }
  if(result.timeLimit){
    timeLimit = Number(result.timeLimit) * 60 * 1000;
  }
});

function blockScroll(e) {
  if (scrollBlocked) {
    e.preventDefault();
    showMessage();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STOP_SCROLL") {
    scrollBlocked = !!message.enabled;
    if (scrollBlocked) {
      disableScrolling();
    } else {
      enableScrolling();
    }
    return;
  }

  if (message.type === "NEW") {
    tabOpenTime = Date.now();
    
    setTimer();
  }
});

function setTimer(){
  if(timerId) clearInterval(timerId);

    timerId = setInterval(() => {
        if(!tabOpenTime || !timeLimit) return;

        const timeSpent = Date.now() - tabOpenTime;

        // When the limit ends, automatically turn OFF blocking (toggle OFF)
        if(timeSpent >= timeLimit && scrollBlocked){
            scrollBlocked = false;

            chrome.storage.local.set({
                scrollBlocked: false
            });
            enableScrolling();

            clearInterval(timerId);
            timerId = null;
        }
    }, 1000);
}

function disableScrolling() {
  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockScroll, { passive: false });
}

function enableScrolling() {
  window.removeEventListener("wheel", blockScroll);
  window.removeEventListener("touchmove", blockScroll);
  window.removeEventListener("keydown", blockScroll);
}

function showMessage() {
  if (document.getElementById("scroll-msg")) return;

  const msg = document.createElement("div");

  msg.id = "scroll-msg";
  msg.innerText = "Scrolling is stop by the InstaBreak";

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 2000);
}
