/**
 * Serial2UDP Gateway
 *
 * Arduino  <- Serial ->  Gateway  <- UDP ->  Server
 */

//// Please edit: serial port & server
const SERIAL_PORT = "/dev/tty.usbmodem142101";
const ADDRESS = "0.0.0.0";
const PORT = 33333;

const dgram = require("dgram");
const SerialPort = require("serialport");

const client = dgram.createSocket("udp4");

const serial = new SerialPort(SERIAL_PORT, { baudRate: 9600 });

serial.on("data", (data) => {
  client.send(data, PORT, ADDRESS);
});
