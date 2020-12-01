/**
 * Sensor Battle - Server
 */

// Ports for HTTP & UDP Server
const PORT = process.env.PORT || 3000;
const UDP_PORT = 33333;

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
udpserver.on("message", (msg) => {
  const message = decoder.decode(msg).replace(/[\r\n]/, "");
  console.log(`server got: '${message}'`);
  io.emit("message", { message });
});

udpserver.on("listening", () => {
  const address = udpserver.address();
  console.log(`udp server listening on port ${address.port}`);
});

udpserver.bind(UDP_PORT);
