import processing.serial.*;

Serial myPort;
String myText="";
float luxValue = 0; 

void setup(){
  size(2000,800);
  myPort = new Serial(this, "COM3",9600);
  myPort.bufferUntil('\n');
}

void serialEvent(Serial myPort) {
  //Bodenfeuchtigkeit
  myText = myPort.readStringUntil('\n').trim();
  
  // Lichtwert aus der Nachricht extrahieren 
  if (myText.startsWith("Lichtwert: ")) {
    String luxStr = myText.substring(11);
    luxValue = float(luxStr);
  }
}


void draw() {
  background(0);
  fill(255);
  textSize(16);
  
    //Bodenfeuchtigkeit
    if (myText.contains("zu feucht")) {
      text("Bitte nicht mehr gießen", width/2, height/2);
    } else if (myText.contains("perfekt")) {
      text("Mir geht es gut", width/2, height/2);
    } else if (myText.contains("zu trocken")) {
      text("Ich habe Durst", width/2, height/2);
    } else {
      text("Warte auf Daten...", width/2, height/2);
    }


    // Interpretation der Lichtbedingungen basierend auf Lux-Werten
    if (luxValue < 100) {
      text("Ich brauche Licht!", width/2, height/2 + 20);
    } else if (luxValue >= 100 && luxValue <= 1000) {
      text("Perfekte Lichtverhältnisse", width/2, height/2 + 20);
    } else if (luxValue > 1000) {
      text("Es ist zu warm!", width/2, height/2 + 20);
    } else {
      text("Warte auf Daten...", width/2, height/2 + 20);
    }
}
