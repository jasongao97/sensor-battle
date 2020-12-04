/**
 * Sensor Battle - Server
 */

// Ports for HTTP & UDP Server
const PORT = process.env.PORT || 3000;
const UDP_PORT = 33333;

// Cars
const STOP_TIME = 200;
const LOCAL_HOST = "127.0.0.1";

const cars = [
  {
    port: 58001,
    timeout: null,
    player: null,
  },
  {
    port: 58002,
    timeout: null,
    player: null,
  },
  {
    port: 58003,
    timeout: null,
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
http.listen(PORT, function () {
  console.log("Your app is listening on port " + PORT);
});

// Socket.io
io.sockets.on("connection", function (socket) {
  socket.emit("address", { address: ip.address(), port: UDP_PORT });
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

  executeCommand(message);

  address += `:${port}`;
  console.log(`${address} sends: '${message}'`);
  io.emit("message", { message, address });
});

udpserver.on("listening", () => {
  const address = udpserver.address();
  console.log(`udp server listening on port ${address.port}`);
});

udpserver.bind(UDP_PORT);

function executeCommand(command) {
  const format = /^(g|j|m|r|s)\.(go|back|left|right|fire)$/;
  if (!format.test(command)) return;

  const [player, action] = command.split(".");

  for (i in cars) {
    if ((cars[i].player = player)) {
      const { port, timeout } = cars[i];
      clearTimeout(timeout);

      if (action === "go") {
        udpserver.send("w", port, LOCAL_HOST);
      } else if (action === "back") {
        udpserver.send("s", port, LOCAL_HOST);
      } else if (action === "left") {
        udpserver.send("a", port, LOCAL_HOST);
      } else if (action === "right") {
        udpserver.send("d", port, LOCAL_HOST);
      }

      cars[i].timeout = setTimeout(() => {
        udpserver.send("0", port, LOCAL_HOST);
      }, STOP_TIME);
    }
  }
}
