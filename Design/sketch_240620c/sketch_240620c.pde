import processing.serial.*;

Serial myPort;
<<<<<<< HEAD
String myText="";
float luxValue = 0; 
boolean portAvailable = true;

void setup(){
  size(1000,800);
  textAlign(CENTER, CENTER);

   try {
    myPort = new Serial(this, "COM3", 9600);
    myPort.bufferUntil('\n');
  } catch (Exception e) {
    portAvailable = false;
    println("Kein Mikrocontroller angeschlossen oder falscher COM-Port.");
  }
=======
String myText = "";
int touchSensitivity = 0;
int soilMoisture = 0;
float lightLevel = 0;

void setup() {
  size(800, 600);
  // Passe den Port-Namen an, wenn nötig
  myPort = new Serial(this, "/dev/cu.usbmodem1201", 9600);
  myPort.bufferUntil('\n');
>>>>>>> c3c5b9f2116d66a9de28b3bdfb25f98a8876676c
}

void serialEvent(Serial myPort) {
  //Bodenfeuchtigkeit
  myText = myPort.readStringUntil('\n').trim();
<<<<<<< HEAD
  // Lichtwert aus der Nachricht extrahieren 
  if (myText.startsWith("Lichtwert: ")) {
    String luxStr = myText.substring(11);
    luxValue = float(luxStr);
  }
}
=======
  String[] data = split(myText, ',');

  if (data.length == 2) {
    String tag = data[0];
    String value = data[1];
>>>>>>> c3c5b9f2116d66a9de28b3bdfb25f98a8876676c

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
<<<<<<< HEAD
  background(154,205,50); // Hellerer Grüner Hintergrund
  fill(255);
  textSize(46);
  text("Plantoji", width / 2, 50);
  
  textSize(22);

    // Dummy-Daten, wenn der Mikrocontroller nicht verfügbar ist
  if (!portAvailable) {
    simulateData();
  }
  
   // Bodenfeuchtigkeit
  String moistureStatus = "";
  if (myText.contains("zu feucht")) {
    moistureStatus = "Bitte nicht mehr gießen";
  } else if (myText.contains("perfekt")) {
    moistureStatus = "Mir geht es gut";
  } else if (myText.contains("zu trocken")) {
    moistureStatus = "Ich habe Durst";
  } else {
    moistureStatus = "Warte auf Daten...";
  }
  text(moistureStatus, width / 2, height / 2 - 20);


   // Interpretation der Lichtbedingungen basierend auf Lux-Werten
   String lightStatus = "";
  if (luxValue < 100) {
    lightStatus = "Ich brauche Licht!";
  } else if (luxValue >= 100 && luxValue <= 1000) {
    lightStatus = "Perfekte Lichtverhältnisse";
  } else if (luxValue > 1000) {
    lightStatus = "Es ist zu warm!";
  } else {
    lightStatus = "Warte auf Daten...";
  }
  text(lightStatus, width / 2, height / 2 + 20);
  
  // Zeichne Icons oder farbige Rechtecke basierend auf den Daten
  drawStatusIcon("feucht", width / 2 - 150, height / 2 + 50, 50, color(0, 0, 255)); 
  drawStatusIcon("licht", width / 2 + 150, height / 2 + 50, 50, color(255, 255, 0));
  
}

void drawStatusIcon(String type, float x, float y, float size, color c) {
  fill(c);
  if (type.equals("feucht")) {
    // Tropfen
    beginShape();
    vertex(x, y - size / 2);
    bezierVertex(x + size / 2, y - size / 2, x + size / 4, y + size / 2, x, y + size / 2);
    bezierVertex(x - size / 4, y + size / 2, x - size / 2, y - size / 2, x, y - size / 2);
    endShape(CLOSE);
  } else if (type.equals("licht")) {
    // Sonne
    ellipse(x, y, size, size);
    float rayLength = size / 2;
    float angleIncrement = TWO_PI / 8;
    for (float angle = 0; angle < TWO_PI; angle += angleIncrement) {
      float rayX = x + cos(angle) * rayLength / 2;
      float rayY = y + sin(angle) * rayLength / 2;
      line(x, y, rayX, rayY);
    }
  }
}


// Funktion zum Simulieren von Daten
void simulateData() {
  // Wechsel zwischen verschiedenen Zuständen
  float currentTime = millis() / 1000.0;
  if (currentTime % 10 < 3) {
    myText = "zu feucht";
    luxValue = 50;
  } else if (currentTime % 10 < 6) {
    myText = "perfekt";
    luxValue = 500;
  } else {
    myText = "zu trocken";
    luxValue = 1500;
=======
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
>>>>>>> c3c5b9f2116d66a9de28b3bdfb25f98a8876676c
  }
}
