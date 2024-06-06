/*
 * Bibliotheken 
 */
#include <LiquidCrystal.h>

//Soil Moisture
const int moisturePin = 10;
const int moisturePowerPin = 0;
const int soilMoistLevelLow = 200;  
const int soilMoistLevelHigh = 300; 

/** --------------------------------------------------
 *  ------------  Set UP Method       ----------------
 *  --------------------------------------------------
 */
void setup() {
  // Serialization with Baudrate 9600
  Serial.begin(9600);

  /*
      initialise : Bodenfeuchtigkeit
  */
  pinMode(moisturePin,INPUT);
  pinMode(moisturePowerPin,OUTPUT);



  
}



/** --------------------------------------------------
 *  ------------  Ausführungmethode   ----------------
 *  --------------------------------------------------
 */
void loop() {

  /*
     Bodenfeuchtigkeit
  */
  digitalWrite(moisturePowerPin,HIGH);
  delay(100);
  int soilMoist = analogRead(moisturePin);
  Serial.print("Analog Value: ");
  Serial.print(soilMoist);
  
  // Auswertung der Bodenfeuchtigkeit : 200-300 Perfekt für Pflanze 
  if (soilMoist > soilMoistLevelHigh) {
    Serial.println(" Status: Der Boden ist zu feucht");
  } else if (soilMoist >= soilMoistLevelLow && soilMoist < soilMoistLevelHigh) {
    Serial.println(" Status: Die Bodenfeuchtigkeit ist perfekt");
  } else {
    Serial.println(" Status: Der Boden ist zu trocken");
  }

  digitalWrite(moisturePowerPin, LOW);  
  delay(2000); 
  



}
