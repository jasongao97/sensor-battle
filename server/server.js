/**
 * Sensor Battle - Server
 */

// Ports for HTTP & UDP Server
const WEB_SERVER_PORT = process.env.PORT || 3000;
const UDP_SERVER_PORT = 33333;

// Control gateway
const GATEWAY_ADDRESS = "127.0.0.1";
const GATEWAY_PORT = 30000;

// Mapping
const cars = [
  {
    player: 'j',
  },
  {
    player: null,
  },
  {
    player: null,
  },
];

// For live web app
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Setting up a udp server
const dgram = require("dgram");
const udpserver = dgram.createSocket("udp4");
const decoder = new TextDecoder("utf-8");

// Utility
const ip = require("ip");

// Serve static files
app.use(express.static("public"));

// Start the HTTP server
http.listen(WEB_SERVER_PORT, function () {
  console.log("Your app is listening on port " + WEB_SERVER_PORT);
});

// Socket.io
io.sockets.on("connection", function (socket) {
  socket.emit("address", { address: ip.address(), port: UDP_SERVER_PORT });
  console.log("We have a new client: " + socket.id);

  socket.on("tick", function () {
    socket.emit("tock");
  });

  socket.on("disconnect", function () {
    console.log("Client has disconnected " + socket.id);
  });
});

// UDP
udpserver.on("message", (msg, { address, port }) => {
  const message = decoder.decode(msg).replace(/[\r\n]/, "");
  if (!message) return;

  forwardCommand(message);

  address += `:${port}`;
  console.log(`${address} sends: '${message}'`);
  io.emit("message", { message, address });
});

udpserver.on("listening", () => {
  const address = udpserver.address();
  console.log(`udp server listening on port ${address.port}`);
});

udpserver.bind(UDP_SERVER_PORT);

function forwardCommand(command) {
  const format = /^\w+\.(go|back|left|right|fire)$/;
  if (!format.test(command)) return;

  const [player, action] = command.split(".");

  for (i in cars) {
    if (cars[i].player === player) {
      // forward the command to the exact car
      udpserver.send(`${i}.${action}`, GATEWAY_PORT, GATEWAY_ADDRESS);
    }
  }
}
