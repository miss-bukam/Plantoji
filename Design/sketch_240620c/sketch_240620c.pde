import processing.serial.*;

Serial myPort;
String myText = "";
int touchSensitivity = 0;
int soilMoisture = 0;
float lightLevel = 0;

void setup() {
  size(800, 600);
  // Passe den Port-Namen an, wenn nötig
  myPort = new Serial(this, "/dev/cu.usbmodem1201", 9600);
  myPort.bufferUntil('\n');
}

void serialEvent(Serial myPort) {
  myText = myPort.readStringUntil('\n').trim();
  String[] data = split(myText, ',');

  if (data.length == 2) {
    String tag = data[0];
    String value = data[1];

    if (tag.equals("LED")) {
      touchSensitivity = int(value);
    } else if (tag.equals("MOISTURE")) {
      soilMoisture = int(value);
    } else if (tag.equals("LIGHT")) {
      lightLevel = float(value);
    }
  }
}

void draw() {
  background(255);
  fill(0);
  textSize(32);
  text("Plantoji", 50, 40);

  textSize(22);


  // Touch Sensitivity
  fill(0);
  text("Touch Sensitivity: " + touchSensitivity, 50, 100);
  fill(touchSensitivity > 25 ? color(255, 0, 0) : color(0, 255, 0));

  // Soil Moisture
  fill(0);
  text("Soil Moisture: " + soilMoisture, 50, 200);
  fill(soilMoisture > 300 ? color(255, 0, 0) : soilMoisture >= 200 ? color(0, 255, 0) : color(0, 0, 255));

  // Display Soil Moisture Status
  if (soilMoisture > 300) {
    text("Status: Bitte nicht mehr gießen", 50, 250);
  } else if (soilMoisture >= 200 && soilMoisture <= 300) {
    text("Status: Mir geht es gut", 50, 200);
  } else {
    text("Status: Ich habe Durst", 50, 250);
  }

  // Light Level
  fill(0);
  text("Light Level: " + lightLevel, 50, 300);
  fill(255, 255, 0);
  
  // Waiting for data text
  if (myText.equals("")) {
    fill(0);
    text("Warte auf Daten...", 50, 400);
  }
}
