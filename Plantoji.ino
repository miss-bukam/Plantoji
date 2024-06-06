/*
 * Bibliotheken 
 */
#include <Boards.h>
#include <Firmata.h>
#include <FirmataConstants.h>
#include <FirmataDefines.h>
#include <FirmataMarshaller.h>
#include <FirmataParser.h>
#include <LiquidCrystal.h>

//Soil Moisture
const int moisturePin = 'An dem Arduino'
int moistureValue = 0;


//Button
const int buttonPin = 'An dem Arduino'
bool buttonPressed = false;

//LDR - Lightsensor
const int ldrPin = 'An dem Arduino'
int lightValue = 0;


//LCD - Screen
const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;   
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);  
// rs = number of the Arduino pin that is connected to the RS pin on the LCD
// en = the number of the Arduino pin that is connected to the enable pin on the LCD
// d4- d7 = the numbers of the Arduino pins that are connected to the corresponding data pins on the



// TouchPin
const int touchPin = 'An dem Arduino'





/** --------------------------------------------------
 *  ------------  Set UP Method       ----------------
 *  --------------------------------------------------
 */
void setup() {
 
  
  Serial.begin(9600);
  
  // Button
  pinMode(buttonPin, INPUT_PULLUP);
  



  /*
       initialise : LCD Screen
  */
  lcd.begin(16, 2);   



  /*
       initialise : LDR Lightsensor
  */
  pinMode(ldrPin,INPUT);
 




  /*
      initialise : Bodenfeuchtigkeit
  */

  pinMode(moisturePin,INPUT);




  
   /*
       initialise : Touch
  */

  pinMode(touchPin, INPUT);
  
}



/** --------------------------------------------------
 *  ------------  Ausführungmethode   ----------------
 *  --------------------------------------------------
 */
void loop() {
  
  /*
      LDR - Lightsensor
  */

  lightValue = analogRead(lightPin);
  /* .....  
  //Fall 1 :Falls es zu sonnig ist

  //Fall2 : Falls es schattig is
  
  */



  

  /*
       initialise : Toch
  */

  pinMode(touchPin, INPUT);

  touchValue = analogRead(touchPin);
  Serial.println(touchValue);




/*
    Button
*/

  buttonPressed = !digitalRead(buttonPin);
  if(buttonPressed){
    //TODO: Passiert was
    Serial.print("......");
  }

}
