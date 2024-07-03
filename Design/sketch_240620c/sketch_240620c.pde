import processing.serial.*;

Serial myPort;
String myText = "";
float luxValue = 0;
boolean portAvailable = true;
boolean topfTouched = false; // Neue Variable für Topf-Berührung

void setup() {
  size(1000, 800);
  textAlign(CENTER, CENTER);

  try {
    myPort = new Serial(this, "/dev/cu.usbmodem1101", 9600); // COM3 durch deinen korrekten Port ersetzen
    myPort.bufferUntil('\n');
  } catch (Exception e) {
    portAvailable = false;
    println("Kein Mikrocontroller angeschlossen oder falscher COM-Port.");
  }
}

void serialEvent(Serial myPort) {
  myText = myPort.readStringUntil('\n').trim();

  // Bodenfeuchtigkeit aus der Nachricht extrahieren
  if (myText.startsWith("Status: ")) {
    String moistureStatus = myText.substring(8);
    if (moistureStatus.equals("Der Boden ist zu feucht")) {
      myText = "zu feucht";
    } else if (moistureStatus.equals("Die Bodenfeuchtigkeit ist perfekt")) {
      myText = "perfekt";
    } else if (moistureStatus.equals("Der Boden ist zu trocken")) {
      myText = "zu trocken";
    }
  }

  // Lichtwert aus der Nachricht extrahieren
  if (myText.startsWith("Lichtwert: ")) {
    String luxStr = myText.substring(11);
    luxValue = float(luxStr);
  }

  // Topf-Berührung aus der Nachricht extrahieren
  if (myText.equals("Topf angefasst")) {
    topfTouched = true;
  } else {
    topfTouched = false;
  }
}

void draw() {
  background(154, 205, 50); // Hellerer Grüner Hintergrund
  fill(255);
  textSize(46);
  text("Plantoji", width / 2, 50);

  textSize(22);

  // Dummy-Daten, wenn der Mikrocontroller nicht verfügbar ist
  if (!portAvailable) {
    simulateData();
  }

  // Positionen für die Anzeigen
  float boxX = width / 4;
  float boxWidth = width / 2;
  float boxY = height / 4;
  float boxHeight = height / 3;
  float statusY = boxY + 200; // Abstand vom oberen Rand des Rahmens erhöhen
  float iconOffset = 100; // Abstand zwischen Text und Icon

  // Zeichne den Rahmen
  stroke(255);
  noFill();
  rect(boxX, boxY, boxWidth, boxHeight);
  
  // Zeichne den Titel des Rahmens
  fill(255);
  textSize(32);
  text("Gesundheitszustand", width / 2, boxY + 30); // Titel innerhalb des Rahmens
  
  textSize(22);

  // Bodenfeuchtigkeit
  String moistureStatus = "";
  if (myText.equals("zu feucht")) {
    moistureStatus = "Bitte nicht mehr gießen";
  } else if (myText.equals("perfekt")) {
    moistureStatus = "Mir geht es gut";
  } else if (myText.equals("zu trocken")) {
    moistureStatus = "Ich habe Durst";
  } else {
    moistureStatus = "Warte auf Daten...";
  }
  fill(255); // Weiß
  text(moistureStatus, boxX + boxWidth / 4, statusY - iconOffset);
  drawStatusIcon(moistureStatus, boxX + boxWidth / 4, statusY, 50);

  // Lichtbedingungen
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
  fill(255);
  text(lightStatus, boxX + 3 * boxWidth / 4, statusY - iconOffset);
  drawStatusIcon(lightStatus, boxX + 3 * boxWidth / 4, statusY, 50);

  // Topf-Berührung
  float touchX = width / 2;
  float touchY = boxY + boxHeight + 60;
  if (topfTouched) {
    fill(0, 0, 255); // Blau
    ellipse(touchX, touchY + 20, 50, 50);
    fill(255);
    text("Topf angefasst", touchX, touchY - 20);
  } else {
    fill(128); // Grau
    ellipse(touchX, touchY + 20, 50, 50);
    fill(255);
    text("Topf nicht angefasst", touchX, touchY - 20);
  }
}

void drawStatusIcon(String status, float x, float y, float size) {
  if (status.contains("Bitte nicht mehr gießen")) {
    fill(255, 0, 0); // Rot
  } else if (status.contains("Mir geht es gut")) {
    fill(0, 255, 0); // Grün
  } else if (status.contains("Ich habe Durst")) {
    fill(255, 165, 0); // Orange
  } else if (status.contains("zu feucht")) {
    fill(255, 0, 0); // Rot
  } else if (status.contains("Perfekte Lichtverhältnisse")) {
    fill(0, 255, 0); // Grün
  } else if (status.contains("zu trocken")) {
    fill(255, 165, 0); // Orange
  } else if (status.contains("Ich brauche Licht!")) {
    fill(255, 165, 0); // Orange
  } else if (status.contains("Es ist zu warm!")) {
    fill(255, 0, 0); // Rot
  } else {
    fill(128); // Grau
  }

  ellipse(x, y, size, size);
}

// Funktion zum Simulieren von Daten
void simulateData() {
  // Wechsel zwischen verschiedenen Zuständen
  float currentTime = millis() / 1000.0;
  if (currentTime % 10 < 3) {
    myText = "zu feucht";
    luxValue = 50;
    topfTouched = false;
  } else if (currentTime % 10 < 6) {
    myText = "perfekt";
    luxValue = 500;
    topfTouched = true;
  } else {
    myText = "zu trocken";
    luxValue = 1500;
    topfTouched = false;
  }
}
