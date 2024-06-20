import processing.serial.*;

Serial myPort;
String myText="";

void setup(){
  size(300,300);
  myPort = new Serial(this, "COM3",9600);
  myPort.bufferUntil('\n');
}

void serialEvent(Serial myPort) {
  myText = myPort.readStringUntil('\n').trim();
}


void draw() {
  background(0);
  fill(255);
  textSize(16);
  
  if (myText.contains("zu feucht")) {
    text("Bitte nicht mehr gießen", 50, 100);
  } else if (myText.contains("perfekt")) {
    text("Mir geht es gut", 50, 100);
  } else if (myText.contains("zu trocken")) {
    text("Ich habe Durst", 50, 100);
  } else {
    text("Warte auf Daten...", 50, 100);
  }
}
