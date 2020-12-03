#include <WiFi.h>
#include <AsyncUDP.h>
#include "ESP32MotorControl.h"

#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

#define MOTOR_GPIO_IN1 18
#define MOTOR_GPIO_IN2 19
#define MOTOR_GPIO_IN3 22
#define MOTOR_GPIO_IN4 23

//// Please edit: your WiFi info
#define WIFI_SSID ""
#define WIFI_PASS ""

char ssid[] = WIFI_SSID;
char pass[] = WIFI_PASS;

AsyncUDP udp;

ESP32MotorControl motorControl = ESP32MotorControl();
int speed = 30;
int turningSpeed = 25;

unsigned long lastCommandTime = 0;

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); //disable brownout detector

  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);

  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  digitalWrite(LED_BUILTIN, HIGH);

  motorControl.attachMotors(MOTOR_GPIO_IN1, MOTOR_GPIO_IN2, MOTOR_GPIO_IN3, MOTOR_GPIO_IN4);

  listenUDP();
}

void loop() {}

void listenUDP() {
  if (udp.listen(12580)) {
    Serial.print("UDP running @ ");
    Serial.print(WiFi.localIP());
    Serial.println(":12580");
    udp.onPacket([](AsyncUDPPacket packet) {
      char action = packet.data()[0];

      Serial.println(action);

      if (action == 'w') {
        motorControl.motorForward(1, speed);
        motorControl.motorForward(0, speed);
      } else if (action == 's') {
        motorControl.motorReverse(1, speed);
        motorControl.motorReverse(0, speed);
      } else if (action == 'a') {
        motorControl.motorForward(1, turningSpeed);
        motorControl.motorReverse(0, turningSpeed);
      } else if (action == 'd') {
        motorControl.motorReverse(1, turningSpeed);
        motorControl.motorForward(0, turningSpeed);
      } else if (action == '0') {
        motorControl.motorsStop();
      }
    });
  }
}
