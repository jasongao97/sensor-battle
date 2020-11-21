/*
  Sensor Battle RC - Control Over Serial
*/

// Button
const int buttonPin = 2;
int lastState = LOW;

void setup() {
  // initial pins and serial
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  // read the state of the switch into a local variable:
  int reading = digitalRead(buttonPin);

  // debounce
  if (lastState == HIGH && reading == LOW) {
    delay(50);
    if (digitalRead(buttonPin) == LOW) {
      Serial.println("Hello!");
    }
  }

  lastState = reading;
}
