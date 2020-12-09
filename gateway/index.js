/**
 * Sensor Battle - Gateway
 */

// Setting up a udp server
const dgram = require("dgram");
const server = dgram.createSocket("udp4");
const decoder = new TextDecoder("utf-8");

const UDP_SERVER_PORT = 30000;
const STOP_TIME = 300;

const CAR_CONTROL_PORT = 12580;
const cars = [
  {
    address: "192.168.50.174",
    timeout: null,
  },
  {
    address: "192.168.50.175",
    timeout: null,
  },
  {
    address: "192.168.50.254",
    timeout: null,
  },
];

server.on("message", (msg) => {
  const message = decoder.decode(msg).replace(/[\r\n]/, "");
  if (!message) return;

  executeCommand(message);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`udp server listening on port ${address.port}`);
});

server.bind(UDP_SERVER_PORT);

function executeCommand(command) {
  const format = /^(0|1|2)\.(go|back|left|right|fire)$/;
  if (!format.test(command)) return;

  const [car, action] = command.split(".");
  const { address, timeout } = cars[car];
  clearTimeout(timeout);

  if (action === "go") {
    server.send("w", CAR_CONTROL_PORT, address);
  } else if (action === "back") {
    server.send("s", CAR_CONTROL_PORT, address);
  } else if (action === "left") {
    server.send("a", CAR_CONTROL_PORT, address);
  } else if (action === "right") {
    server.send("d", CAR_CONTROL_PORT, address);
  } else if (action === "fire") {
    server.send("f", CAR_CONTROL_PORT, address);
  }

  cars[car].timeout = setTimeout(() => {
    server.send("0", CAR_CONTROL_PORT, address);
  }, STOP_TIME);
}
