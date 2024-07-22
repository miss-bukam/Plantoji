#include <Adafruit_CircuitPlayground.h>

// Globale Variablen für LED
int threshold = 15;
int current = 0;

int topf = 0;

// Pins für Bodenfeuchtigkeitssensor
const int moisturePin = 10;
const int moisturePowerPin = 0;
const int soilMoistLevelLow = 200;
const int soilMoistLevelHigh = 300;


void setup() {
  Serial.begin(9600);
  CircuitPlayground.begin();
  CircuitPlayground.setBrightness(40);
  pinMode(moisturePin, INPUT);
  pinMode(moisturePowerPin, OUTPUT);
}

void loop() {
  measureMoisture();     // Messung der Bodenfeuchtigkeit
  measureLight();        // Messung des Lichtwerts
  controlLED();          // Steuerung der LEDs
  checkTouch();          // Überprüfung, ob der Topf angefasst wird
  delay(100);  // Kurze Pause, um die Serielle Kommunikation nicht zu überlasten

}

/*
LED
*/
void controlLED() {
  current = CircuitPlayground.readCap(1);
  Serial.print("Touch-sensitivity: ");
  Serial.println(current);
  
  for (int i = 0; i < 10; i++) {
    if (current > threshold * (i + 1)) {
      CircuitPlayground.setPixelColor(i, 255, 0, 0);  // Rot, wenn Schwellenwert überschritten
    } else {
      CircuitPlayground.setPixelColor(i, 0, 255, 0);  // Grün, wenn Schwellenwert nicht überschritten
    }
  }
}

/*
Topf-Touch
*/
void checkTouch() {
  topf = CircuitPlayground.readCap(0);
  Serial.print("Topf Value: ");
  Serial.println(topf);
  
  if (topf > 5) {
    Serial.println("Topf angefasst");
    CircuitPlayground.setPixelColor(0, 0, 0, 255);  // Zeige Rot auf der ersten LED an
  } else {
    Serial.println("Topf nicht angefasst");
    CircuitPlayground.setPixelColor(0, 0, 0, 0);  // Zeige Grün auf der ersten LED an, wenn nicht angefasst
  }
}



/*
  Bodenfeuchtigkeit
*/
void measureMoisture() {
  digitalWrite(moisturePowerPin, HIGH);
  delay(100);
  int soilMoist = analogRead(moisturePin);
  Serial.print("Analog Value: ");
  Serial.print(soilMoist);
  
  if (soilMoist > soilMoistLevelHigh) {
    Serial.println(" Status: Der Boden ist zu feucht");
  } else if (soilMoist >= soilMoistLevelLow && soilMoist < soilMoistLevelHigh) {
    Serial.println(" Status: Die Bodenfeuchtigkeit ist perfekt");
  } else {
    Serial.println(" Status: Der Boden ist zu trocken");
  }
  
  digitalWrite(moisturePowerPin, LOW);
}

/*
  Licht
*/
void measureLight() {
  float lux = CircuitPlayground.lightSensor();
  Serial.print("Lichtwert: ");
  Serial.println(lux);
}