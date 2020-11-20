/**
 * Sensor Battle - Web Client / Dev Console
 */

const socket = io.connect();

let timer = 0;

const title = document.getElementById("title");
const messageBox = document.getElementById("message-box");
const consoleTitle = document.getElementById("console-title")
const latencyIndicator = document.getElementById("latency");

socket.on("connect", function () {
  console.log("connected");
});

// Update latency when receive 'tock' event
socket.on("tock", function () {
  const latency = new Date() - timer;
  latencyIndicator.innerHTML = latency + " ms";

  setTimeout(() => {
    updateLatency();
  }, 200);
});

// Get current server's IP address
socket.on("address", function ({ address, port }) {
  consoleTitle.innerText = `UDP Server @ ${address}:${port}`;
});

// Receive UDP messages
socket.on("message", function ({ message }) {
  messageBox.innerHTML += `<p class="message">${message}</p>`;
  messageBox.scrollTop = messageBox.scrollHeight
});

function updateLatency() {
  timer = new Date();
  socket.emit("tick");
}

updateLatency();
