/**
 * test/script.js
 * Sensor Battle - Web Client / Dev Console
 */

const socket = io.connect();

let timer = 0;

let activeTab = "console";

const title = document.getElementById("title");
const serverInfo = document.getElementById("server-info");
const latencyIndicator = document.getElementById("latency");

const messageBox = document.getElementById("message-box");
const playgroundBox = document.getElementById("playground");

const tabC = document.getElementById("tab-c");
const tabP = document.getElementById("tab-p");

tabC.addEventListener("click", function () {
  activeTab = "console";
  tabC.classList.add("active");
  tabP.classList.remove("active");
  messageBox.style.display = "block";
  playgroundBox.style.display = "none";
});
tabP.addEventListener("click", function () {
  activeTab = "playground";
  tabP.classList.add("active");
  tabC.classList.remove("active");
  messageBox.style.display = "none";
  playgroundBox.style.display = "block";

  playground.resizeCanvas(
    playgroundBox.clientWidth,
    playgroundBox.clientHeight
  );
});

socket.on("connect", function () {
  console.log("connected");
});

// Update latency when receive 'tock' event
socket.on("tock", function () {
  const latency = new Date() - timer;
  latencyIndicator.innerHTML = latency + " ms";

  setTimeout(() => {
    updateLatency();
  }, 1000);
});

// Get current server's IP address
socket.on("address", function ({ address, port }) {
  serverInfo.innerText = `UDP Server @ ${address}:${port}`;
});

// Receive messages
socket.on("message", function ({ message, address }) {
  if (activeTab === "playground") {
    executeCommand(message);
  }

  const messages = document.getElementsByClassName("message");
  if (messages.length && messages[messages.length - 1].innerText === message) {
    const lastLog = document.getElementsByClassName("head")[messages.length - 1];
    let badge;
    if (lastLog.firstChild.nodeName === 'SPAN') {
      badge = lastLog.firstChild;
    } else {
      badge = document.createElement('SPAN');
      badge.innerText = 1;
      lastLog.insertBefore(badge, lastLog.firstChild)
    }
    badge.innerText = +badge.innerText + 1;
  } else {
    messageBox.innerHTML += `<div class="log"><div class="head"><p class="message">${message}</p></div><p class="address">${address}</p></div>`;
    messageBox.scrollTop = messageBox.scrollHeight;
  }
});

function executeCommand(command) {
  const format = /^(g|j|m|r|s)\.(go|back|left|right|fire)$/;
  if (!format.test(command)) return;

  const [player, action] = command.split(".");
  playground.exe(player, action);
}

function updateLatency() {
  timer = new Date();
  socket.emit("tick");
}

updateLatency();
