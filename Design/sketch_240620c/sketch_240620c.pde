import processing.serial.*;
import java.io.PrintWriter;

Serial myPort;
String myText = "";
float luxValue = 0;
boolean portAvailable = true;
boolean topfTouched = false; // Neue Variable für Topf-Berührung
String moistureStatus = ""; // Variable für Bodenfeuchtigkeit

PrintWriter output;

void setup() {
  size(1000, 800);
  textAlign(CENTER, CENTER);

  // CSV-Datei erstellen und Header schreiben
  output = createWriter("output.csv");
  output.println("Zeit,Bodenfeuchtigkeit,Luxwert,TopfBeruehrt");

  try {
    myPort = new Serial(this, "COM3", 9600); // COM3 durch deinen korrekten Port ersetzen
    myPort.bufferUntil('\n');
  } catch (Exception e) {
    portAvailable = false;
    println("Kein Mikrocontroller angeschlossen oder falscher COM-Port.");
  }
}

void serialEvent(Serial myPort) {
  String inString = myPort.readStringUntil('\n');
  if (inString != null) {
    inString = inString.trim();
    println("Received: " + inString);

    if (inString.startsWith("Status: ")) {
      moistureStatus = inString.substring(8);
    } else if (inString.startsWith("Lichtwert: ")) {
      luxValue = float(inString.substring(11));
    } else if (inString.startsWith("Topf Value: ")) {
      int topfValue = int(inString.substring(11));
      topfTouched = topfValue > 2;
    }

    // Daten in CSV-Datei schreiben
    String timeStamp = str(hour()) + ":" + nf(minute(), 2) + ":" + nf(second(), 2);
    output.println(timeStamp + "," + moistureStatus + "," + luxValue + "," + topfTouched);
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
  String moistureMessage = "";
  if (moistureStatus.equals("Der Boden ist zu feucht")) {
    moistureMessage = "Bitte nicht mehr gießen";
  } else if (moistureStatus.equals("Die Bodenfeuchtigkeit ist perfekt")) {
    moistureMessage = "Mir geht es gut";
  } else if (moistureStatus.equals("Der Boden ist zu trocken")) {
    moistureMessage = "Ich habe Durst";
  } else {
    moistureMessage = "Warte auf Daten...";
  }
  fill(255); // Weiß
  text(moistureMessage, boxX + boxWidth / 4, statusY - iconOffset);
  drawStatusIcon(moistureMessage, boxX + boxWidth / 4, statusY, 50);

  // Lichtbedingungen
  String lightMessage = "";
  if (luxValue < 100) {
    lightMessage = "Ich brauche Licht!";
  } else if (luxValue >= 100 && luxValue <= 1000) {
    lightMessage = "Perfekte Lichtverhältnisse";
  } else if (luxValue > 1000) {
    lightMessage = "Es ist zu warm!";
  } else {
    lightMessage = "Warte auf Daten...";
  }
  fill(255);
  text(lightMessage, boxX + 3 * boxWidth / 4, statusY - iconOffset);
  drawStatusIcon(lightMessage, boxX + 3 * boxWidth / 4, statusY, 50);

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
  if (status.contains("Bitte nicht mehr gießen") || status.contains("Es ist zu warm!")) {
    fill(255, 0, 0); // Rot
  } else if (status.contains("Mir geht es gut") || status.contains("Perfekte Lichtverhältnisse")) {
    fill(0, 255, 0); // Grün
  } else if (status.contains("Ich habe Durst") || status.contains("Ich brauche Licht!")) {
    fill(255, 165, 0); // Orange
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
    moistureStatus = "Der Boden ist zu feucht";
    luxValue = 50;
    topfTouched = false;
  } else if (currentTime % 10 < 6) {
    moistureStatus = "Die Bodenfeuchtigkeit ist perfekt";
    luxValue = 500;
    topfTouched = true;
  } else {
    moistureStatus = "Der Boden ist zu trocken";
    luxValue = 1500;
    topfTouched = false;
  }

  // Daten in CSV-Datei schreiben (für Simulation)
  String timeStamp = str(hour()) + ":" + nf(minute(), 2) + ":" + nf(second(), 2);
  output.println(timeStamp + "," + moistureStatus + "," + luxValue + "," + topfTouched);
}

// CSV-Datei schließen, wenn das Programm beendet wird
void exit() {
  output.flush();
  output.close();
  super.exit();
}
