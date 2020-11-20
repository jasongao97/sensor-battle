
/*
  Sensor Battle - Controller

  Arranged from example of WiFiNINA - WifiUdpSendReceiveString
  https://www.arduino.cc/en/Tutorial/LibraryExamples/WiFiNINAWiFiUdpSendReceiveString
*/

//// enter your wifi info here:
#define WIFI_SSID ""
#define WIFI_PASS ""

#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiUdp.h>

// Wifi
int status = WL_IDLE_STATUS;
char ssid[] = WIFI_SSID;
char pass[] = WIFI_PASS;

// Server address & port
IPAddress serverAddress(0, 0, 0, 0);
unsigned int serverPort = 33333;
unsigned int localPort = 2390;
WiFiUDP Udp;

// Button
const int buttonPin = 2;
int lastState = LOW;

void setup() {
  // initial pins and serial
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);

  // setup wifi and begin
  setupWifi();
  Udp.begin(localPort);
}

void loop() {
  // read the state of the switch into a local variable:
  int reading = digitalRead(buttonPin);

  // debounce
  if (lastState == HIGH && reading == LOW) {
    delay(50);
    if (digitalRead(buttonPin) == LOW) {
      sendMessage("Hello!");
    }
  }

  lastState = reading;
}

void sendMessage(char* message) {
  // send a UDP message to server
  Udp.beginPacket(serverAddress, serverPort);
  Udp.write(message);
  Udp.endPacket();

  Serial.println("Sent!");
}

void setupWifi() {
  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);

    // wait 1 second for connection:
    delay(1000);
  }

  // report and turn on the builtin LED when connected:
  Serial.println("Connected to wifi");
  digitalWrite(LED_BUILTIN, HIGH);

  printWifiStatus();
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
