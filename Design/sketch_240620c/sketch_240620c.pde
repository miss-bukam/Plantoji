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
  drawStatusIcon(moistureStatus, width / 2 - 200, height / 2, 50);
  drawStatusIcon(lightStatus, width / 2 + 200, height / 2, 50);

  // Zeige Topf-Berührung an
  if (topfTouched) {
    fill(0, 0, 255); // Blau
    ellipse(width / 2, height / 2 + 60, 50, 50);
    fill(255);
    text("Topf angefasst", width / 2, height / 2 + 80);
  }
}

void drawStatusIcon(String status, float x, float y, float size) {
  if (status.contains("zu feucht")) {
    fill(0, 0, 255); // Blau
  } else if (status.contains("perfekt")) {
    fill(0, 255, 0); // Grün
  } else if (status.contains("zu trocken") || status.contains("Licht")) {
    fill(255, 165, 0); // Orange
  } else if (status.contains("warm")) {
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
