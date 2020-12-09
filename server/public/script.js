/**
 * /script.js
 * Sensor Battle - Live Stream / Web Controller
 */

const socket = io.connect();

const names = ["🟪No.1", "🟦No.2", "🟨No.3"];

const welcome = document.getElementById("welcome");
const joinButton = document.getElementById("join-button");
const nameInput = document.getElementById("name-input");
const controlBar = document.getElementById("control-bar");

const equipmentList = document.getElementById("equipment-list");
const requestButtons = document.getElementsByClassName("request-buttons");
const releaseButton = document.getElementById("release-button");

const statusTitle = document.getElementById("status-title");
const statusSubtitle = document.getElementById("status-subtitle");
const instruction = document.getElementById("instruction");

const EquipmentSection = (index, status, requestable) => `
  <div class="equipment-section">
    <div class="info">
      <h1>${names[index]}</h1>
      <p>${status}</p>
    </div>

    ${
      requestable && operating === null
        ? `<button class="request-buttons" onclick="requestToControl(${index})">Request to operate</button>`
        : ""
    }
  </div>
`;

let myname = "";
let joined = false;
let operating = null;

socket.on("connect", function () {
  console.log("connected");
});

socket.on("joinSucceed", function () {
  if (!joined) {
    welcome.style.display = "none";
    controlBar.style.display = "flex";
    statusTitle.innerText = `Hi! ${myname}.`;
    joined = true;
  }
});

socket.on("status", function (players) {
  equipmentList.innerHTML = players
    .map((player, i) => {
      return EquipmentSection(
        i,
        player ? `controlling by ${player}` : "idle",
        !player
      );
    })
    .join("");

  if (operating === null) {
    const isFull = players.reduce((acc, cur) => acc && cur !== null, true);
    if (isFull) {
      statusSubtitle.innerText = "Sorry, All cars are currently occupied.";
    } else {
      statusSubtitle.innerText = "Please select a car and play.";
    }
  } else {
    statusSubtitle.innerText = `You are controlling ${names[operating]}`;
  }
});

socket.on("permitToOperate", function (index) {
  operating = index;
  instruction.style.display = "flex";
  releaseButton.style.display = "block";
});

socket.on("releaseSucceed", function () {
  operating = null;
  instruction.style.display = "none";
  releaseButton.style.display = "none";
});

joinButton.addEventListener("click", function () {
  const name = nameInput.value;
  myname = name;
  if (name) {
    socket.emit("join", name);
  }
});

releaseButton.addEventListener("click", function () {
  socket.emit("releasePosition");
});

window.addEventListener("keydown", function ({ code }) {
  if (operating !== null) {
    const action = codeToAction(code);
    if (action) socket.emit("action", action);

    const indicator = document.getElementById(code);
    if (indicator) indicator.style.color = '#ff7070';
  }
});

window.addEventListener("keyup", function ({ code }) {
  const indicator = document.getElementById(code);
  if (indicator) indicator.style.color = '#000';
});

function codeToAction(code) {
  if (code === "ArrowUp" || code === "KeyW") return "go";
  if (code === "ArrowDown" || code === "KeyS") return "back";
  if (code === "ArrowLeft" || code === "KeyA") return "left";
  if (code === "ArrowRight" || code === "KeyD") return "right";
  if (code === "Space") return "fire";
  return false;
}

function requestToControl(index) {
  socket.emit("requestToOperate", index);
}

function executeCommand(command) {
  const format = /^(g|j|m|r|s)\.(go|back|left|right|fire)$/;
  if (!format.test(command)) return;

  const [player, action] = command.split(".");
  playground.exe(player, action);
}
