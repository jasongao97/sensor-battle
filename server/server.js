/**
 * Sensor Battle - Server
 */

// Ports for HTTP & UDP Server
const WEB_SERVER_PORT = process.env.PORT || 3000;
const UDP_SERVER_PORT = 33333;

// Control gateway
const GATEWAY_ADDRESS = "127.0.0.1";
const GATEWAY_PORT = 30000;

// Manage Password
const MANAGE_PASSWORD = "change-me";

// Mapping
const cars = [
  {
    player: null,
  },
  {
    player: null,
  },
  {
    player: null,
  },
];

const users = [
  {
    id: "s",
    name: "Yoda B",
  },
  {
    id: "m",
    name: "Bboki",
  },
  {
    id: "g",
    name: "Muscle Man",
  },
];

// For live web app
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

// Setting up a udp server
const dgram = require("dgram");
const udpserver = dgram.createSocket("udp4");
const decoder = new TextDecoder("utf-8");

// Utility
const ip = require("ip");

// Serve static files
app.use(express.static("public"));

app.get("*", (req, res) => res.sendFile(path.resolve("public", "index.html")));

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

  socket.on("join", function (name) {
    if (!name) return;
    users.push({
      id: socket.id,
      name,
    });
    const players = cars.map((car) => {
      if (!car.player) return null;
      else {
        const player = users.find((user) => user.id === car.player);
        if (player) return player.name;
      }
    });
    socket.emit("joinSucceed");
    socket.emit("status", players);
  });

  socket.on("manage", function (password) {
    if (password !== MANAGE_PASSWORD) return;

    const players = cars.map((car) => {
      if (!car.player) return null;
      else {
        const player = users.find((user) => user.id === car.player);
        if (player) return player.name;
      }
    });
    socket.emit("loginSucceed");
    socket.emit("status", players);
  });

  socket.on("requestToOperate", function (index) {
    if (cars[index].player) return;

    const player = users.find((user) => user.id === socket.id);
    if (!player) return;

    cars[index].player = player.id;

    socket.emit("permitToOperate", index);
    updateAllStatus();
  });

  socket.on("releasePosition", function () {
    cars.forEach((car) => {
      if (car.player === socket.id) car.player = null;
    });

    socket.emit("releaseSucceed");
    updateAllStatus();
  });

  socket.on("switchPosition", function (password, index, next) {
    if (password !== MANAGE_PASSWORD) return;
    const nextPlayer = next === "public" ? null : next;
    if (cars[index].player === nextPlayer) return;

    cars[index].player = nextPlayer;
    updateAllStatus();
  });

  socket.on("action", function (action) {
    forwardCommand(`${socket.id}.${action}`);
  });

  socket.on("disconnect", function () {
    console.log("Client has disconnected " + socket.id);
    const index = users.findIndex((user) => user.id === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
    }
    cars.forEach((car) => {
      if (car.player === socket.id) car.player = null;
    });
    updateAllStatus();
  });

  function updateAllStatus() {
    const players = cars.map((car) => {
      if (!car.player) return null;
      else {
        const player = users.find((user) => user.id === car.player);
        if (player) return player.name;
      }
    });
    io.emit("status", players);
  }
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
  const format = /^[\w_-]+\.(go|back|left|right|fire)$/;
  if (!format.test(command)) return;

  const [player, action] = command.split(".");

  for (i in cars) {
    if (cars[i].player === player) {
      // forward the command to the exact car
      udpserver.send(`${i}.${action}`, GATEWAY_PORT, GATEWAY_ADDRESS);
    }
  }
}
