let scrollBlocked = false;
let timeLimit = 0;
let lockEndTime = 0;
let timerId = null;

chrome.storage.local.get(["scrollBlocked", "timeLimit", "lockEndTime"], (result) => {
  if(result.lockEndTime){
    lockEndTime = result.lockEndTime;
  }
  if (result.scrollBlocked) {
    if(Date.now() >= lockEndTime){
      scrollBlocked = false;

      chrome.storage.local.set({
        scrollBlocked: false,
        lockEndTime: 0
      });
      enableScrolling();
    }else{
      scrollBlocked = true;
      disableScrolling();
      setTimer();
    }
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
      lockEndTime = Date.now() + timeLimit;
      setTimer();
      disableScrolling();

      chrome.storage.local.set({
        scrollBlocked: true,
        lockEndTime: lockEndTime
      });

    } else {
      enableScrolling();
    }
    return;
  }
});

function setTimer(){
  if(!scrollBlocked) return;
  if(timerId) clearInterval(timerId);

    timerId = setInterval(() => {
        if(!timeLimit) return;

        // When the limit ends, automatically turn OFF blocking (toggle OFF)
        if(Date.now() >= lockEndTime && scrollBlocked){
            scrollBlocked = false;

            chrome.storage.local.set({
              scrollBlocked: false,
              lockEndTime: 0,
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
