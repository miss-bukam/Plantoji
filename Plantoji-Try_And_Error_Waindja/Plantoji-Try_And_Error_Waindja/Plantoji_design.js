let colors = "cdf2ba-77af5b-76a855-c4e878-e8f78a-dded63-f1f4e6".split("-").map(a => "#" + a);
let redColors = ["#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#ff0000", "#cc0000", "#990000"];
let particles = [];
let happyMusic;
let angryMusic;

let touchSensitivity = 0;
let highTouchThreshold = 5; 
let topf = false;

let isRed = false;
let audioStarted = false;
let points = 0; // Variable für Punkte
let lastTouchUpdate = 0; // Zeitstempel der letzten Punkte-Erhöhung
let currentLightIntensity = 0; //Mock für lichtintensity

// Die Pop-Ups :) 
let showWaterPopup = false;
let showLightPopup = false;

//Buttons der Pflanze
let infoButton;
let showInfo = false;
let showPlantInfo = false;
let totalHeight = 0;

// --- Für alle 8 Sekunden anzeigen der Werte
let currentTemperature = 0;
let currentHumidity = 0;
let currentMoisture = 'Optimal';
let lastDataUpdate = 0; // Zeitpunkt der letzten Aktualisierung
let lastSensorUpdate = 0; // Zeitpunkt der letzten Sensordaten-Aktualisierung
let dataUpdateInterval = 5000; // 5 Sekunden

//Für Stickers
let stickerDisplayed = false;
// Liste für Sticker-Positionen
let stickerPoints = [];



/**********************************************                               **************************************** 
***********************************************      Pflanzen Design          ****************************************
***********************************************                               ****************************************    
*/


class Particle {
  constructor(args) {
    let def = {
      p: createVector(0, 0),    // Position des Partikels
      v: createVector(0, 0),    // Geschwindigkeit des Partikels
      a: createVector(0, 0),    // Beschleunigung des Partikels
      r: 4,                    // Radius des Partikels
      w: 10,                   // Breite des Partikels
      color: color(255),        // Farbe des Partikels
      child: false,            // Wenn das Partikel ein Kind-Partikel ist
      lastP: createVector(0, 0), // Letzte Position des Partikels
      dead: false              // Wenn das Partikel tot ist
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }

  draw() {
  //  if (this.dead) return;

    push();
    translate(this.p.x, this.p.y);
    rotate(this.v.heading() - PI * 1.5);

    fill(this.color);
    noStroke();

    // Optionaler visueller Effekt
    if (random() > 0.7) {
      let count = int(random(2, 4));
      for (let i = 0; i < count; i++) {
        push();
        rotate((i * 2 - 1) / 1.2 * this.v.heading() / (1 + random(2)) * random(-1, 1) + PI * 0.5);
        fill(random(colors));
        beginShape();
        let ww = this.v.y + random(-5, 5);
        vertex(0, 0);
        curveVertex(ww / 2, 5);
        vertex(ww, 0);
        curveVertex(ww / 2, -5);
        endShape(CLOSE);
        pop();
      }
    }

    for (let o = 0; o < this.r; o += 1) {
      let c = color(random(colors));
      c.setAlpha(random(80));
      stroke(c);
      line(o, 0, o, this.v.y / random(1.5, 2.5));
    }

    pop();
  }

  update() {
   // if (this.dead) return;

    this.lastP = this.p.copy();
    this.p.add(this.v);
    this.v.add(this.a);
    this.v.mult(0.99); // Dämpfung der Geschwindigkeit

    // Färbe die Partikel abhängig von der touchSensitivity
    if (touchSensitivity == 0) {
      this.dead = true;
    } else if (touchSensitivity > 0.1 && touchSensitivity <= 5) {
      this.color = color(random(colors));
    } else if (touchSensitivity > 5) {
      this.color = color(random(redColors));
    }

    if (this.p.y < -50) {
      this.dead = true;
    }
    if (this.child) {
      this.r -= 4;
      if (this.r < 1) {
        this.dead = true;
      }
    }
  }
}


// Erstellung der PArtikel
function generateParticles() {
  for (let i = 0; i < 50; i++) {
    let p = new Particle({
      p: createVector(random(width), height + random(50, 100)),
      v: createVector(random(-2, 2), random(-10, -50)), // Langsamere Geschwindigkeit
      r: random(8, 18),
      w: random(20, 30),
      color: color(random(colors))
    });
    particles.push(p);
  }
}



//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------



//--------------Preload Methode----------------------------
function preload() {
  soundFormats('mp3', 'ogg');
  happyMusic = loadSound('mp3/Deep_in_the_Forest.mp3');
  angryMusic = loadSound('mp3/READY_TO_FIGHT.mp3');
  
  // Für das Bild in der Infobox
  plantImage = loadImage('images/schefflera.jpeg', () => {
    console.log('Bild erfolgreich geladen');
  }, (err) => {
    console.error('Fehler beim Laden des Bildes:', err);
  });
}

//--------------Setup Methode----------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

  setupButtons();
  drawBackground();
  generateParticles();

  // Mock-Daten alle 8 Sekunden initialisieren
  lastDataUpdate = millis();
  lastSensorUpdate = millis();
}

function processSerialData() {
  showPlantInfo = topf;
}


//-------------- Info-Button der Pflanze mit H und I und Methoden dazu -------------------
function setupButtons() {
  // Button für Info
  infoButton = createButton('H');
  infoButton.position(width - 90, 20); // Position des Info-Buttons oben rechts
  infoButton.size(50, 50);
  infoButton.style('font-size', '30px');
  infoButton.style('background-color', 'transparent');
  infoButton.style('border', 'none');
  infoButton.style('color', 'gray');
  infoButton.style('text-shadow', '1px 2px 3px black');
  infoButton.mousePressed(toggleInfo);
  
}

function displayPlantInfo() {
  fill(0);
  noStroke();
  textSize(24);
  textAlign(RIGHT, TOP);
  text(`Touch Sensitivity: ${touchSensitivity}`, width - 20, 60);
  text(`Pot Touch: ${topf}`, width - 20, 100);
  text(`Temperature: ${currentTemperature} °C`, width - 20, 140);
  text(`Humidity: ${currentHumidity} %`, width - 20, 180);
  text(`Moisture: ${currentMoisture}`, width - 20, 220);
  text(`Mood: ${isRed ? 'Angry' : 'Happy'}`, width - 20, 260);
}
function toggleInfo() {
  showInfo = !showInfo;
}

// Funktion für die Infobox alls Pot angefasst wird
function displayPlantDescription() {
  fill(255); // Weißer Hintergrund für die Info-Box
  stroke(0);
  strokeWeight(2);
  rectMode(CENTER);
  // Umrandung der Info-Box
  rect(width / 2, height / 2, 400, 300, 10);

  imageMode(CENTER);
  if (plantImage) {
    image(plantImage, width / 2, height / 2 - 60, 150, 150); // Bild der Pflanze
  } else {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('Bild konnte nicht geladen werden.', width / 2, height / 2);
  }

  fill(0); // Textfarbe schwarz
  noStroke();
  textSize(18);
  
  //Titel
  text('Schefflera actinophylla', width / 2, height / 2 + 20);

  textSize(16);
  text('This plant thrives in bright, indirect light. Keep soil consistently moist, but not soggy. It does not like direct sunlight or overly dry soil.', width / 2, height / 2 + 20, 380, 100);
  text('Providing actual information about the plant. Click the "H" button to view plant details.', width / 2, height / 2 + 100, 380, 100);
}
function togglePlantInfo() {
  showPlantInfo = !showPlantInfo;
}





// ----------------------- Hintergrundbild basierend auf Tageszeit -------------------
function drawBackground() {
  let currentTime = hour();
  if (currentTime >= 6 && currentTime < 12) {
    drawGradient("#B0E0E6", "#FFD700"); // Morgen
  } else if (currentTime >= 12 && currentTime < 18) {
    drawGradient("#1874CD", "#B0E0E6"); // Tag
  } else if (currentTime >= 18 && currentTime < 21) {
    drawGradient("#8470FF", "#FF7F24"); // Abend
  } else {
    drawGradient("#191970", "#000080"); // Nacht
  }
}

function drawGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(c1), color(c2), inter);
    stroke(c);
    line(0, y, width, y);
  }
}


// -------------------  Sticker anzeigen, wenn 50 Frequency Exchange Points erreicht werden
function displaySticker() {
  let stickerInterval = 50;
  
  // Überprüfen, ob ein neuer Sticker verliehen werden soll
  let lastStickerPoint = stickerPoints.length > 0 ? stickerPoints[stickerPoints.length - 1] : 0;

  // Wenn Punkte den letzten Sticker-Punkt + Sticker-Intervall überschreiten und der Sticker noch nicht angezeigt wurde
  if (points >= lastStickerPoint + stickerInterval && !stickerPoints.includes(points)) {
    stickerPoints.push(points); // Füge die aktuellen Punkte zum Array hinzu
  }

  // Zeichnen aller Sticker basierend auf den gespeicherten Punkten
  for (let i = 0; i < stickerPoints.length; i++) {
    fill("#FFD700");
    ellipse(80 + i * 70, height - 80, 60, 60); // Position abhängig von der Anzahl der Sticker
    textSize(20);
    fill("#222");
    textAlign(CENTER, CENTER);
    text("50", 80 + i * 70, height - 80);
  }
}


/*------------     Sprechblase anzeigen, wenn 50 Frequency Exchange Points erreicht werden
function displaySpeechBubble() {
  if (points >= 50) {
    let bubbleWidth = 250;
    let bubbleHeight = 100;
    let bubbleX = (windowWidth - bubbleWidth) / 2;
    let bubbleY = (windowHeight - bubbleHeight) / 2;

    // Sprechblase zeichnen
    fill("#EEB422");
    noStroke("#EEB422");
    rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 40);

    // Text in der Sprechblase anzeigen
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    noStroke();
    text("50 Frequence Exchange Punkte gewonnen!", bubbleX, bubbleY, bubbleWidth, bubbleHeight);
  }
}
*/





/* ---------------------   ALLE MOCKFUNKTIONEN        ----------------------- */
function mockTemperature() {
  return Math.round(random(15, 30)); // Mock-Wert für Temperatur
}

function mockHumidity() {
  return Math.round(random(30, 70)); // Mock-Wert für Luftfeuchtigkeit
}

function mockMoisture() {
  return random() > 0.5 ? 'Low' : 'Optimal'; // Mock-Wert für Bodenfeuchtigkeit
}

function mockLightIntensity() {
  return random(0, 100); // Mock-Wert für Lichtsensitivität
}

function mockSensorData() {
  touchSensitivity = random(0, 10);
  topf = random() > 0.5 ? true : false;
  processSerialData();
}


// Aktualisieren der Daten alle 8 Sekunden
function updateData() {
  currentTemperature = mockTemperature();
  currentHumidity = mockHumidity();
  currentMoisture = mockMoisture();
  currentLightIntensity = mockLightIntensity();
}








// -----------------------------------------------------------------------------------
// ------------------------------ Draw Methode -------__------------------------------
// -----------------------------------------------------------------------------------

function draw() {
  drawBackground(); // Hintergrund neu zeichnen

  particles.forEach(p => {
    p.update();
    console.log(`Particle at (${p.p.x}, ${p.p.y}), Color: ${p.color.toString()}, Dead: ${p.dead}`);
    p.draw();
  });

 // particles = particles.filter(p => !p.dead); // Entfernen Sie die toten Partikel

  // Langsame Aktualisierung der Mock-Daten (alle 8 Sekunden)
  if (millis() - lastDataUpdate > dataUpdateInterval) {
    updateData();
    lastDataUpdate = millis();
  }

  // Mock-Sensordaten regelmäßig aktualisieren
  if (millis() - lastSensorUpdate > dataUpdateInterval) {
    mockSensorData();
    lastSensorUpdate = millis();
  }

  // Musik und Partikel-Farben entsprechend der Sensitivität aktualisieren
  if (touchSensitivity > 5) {
    particles.forEach(p => {
      p.color = color(random(redColors));
    });

    // Audio starten, wenn die Sensitivität hoch genug ist
    if (!audioStarted || !angryMusic.isPlaying()) {
      getAudioContext().resume().then(() => {
        audioStarted = true;
        happyMusic.stop();
        angryMusic.loop();
      }).catch(error => {
        console.error("AudioContext konnte nicht gestartet werden:", error);
      });
    }
  } else {
    particles.forEach(p => {
      p.color = color(random(colors));
    });

    // Audio stoppen, wenn die Sensitivität unter 5 ist
    if (audioStarted && !happyMusic.isPlaying()) {
      getAudioContext().resume().then(() => {
        audioStarted = true;
        angryMusic.stop();
        happyMusic.loop();
      }).catch(error => {
        console.error("AudioContext konnte nicht gestartet werden:", error);
      });
    }
  }

  // ------------- Text für Frequence Exchange Points anzeigen
  fill(0);
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  text('Frequence Exchange points', 20, 20);

  // Punkte anzeigen
  textSize(20);
  text(`Points: ${points}`, 20, 60);

 // ---------------  Überprüfen, ob die Pflanze zu stark angefasst wird
if (touchSensitivity > highTouchThreshold) {
  points -= 5; // Punkte reduzieren, wenn die Sensitivität über dem Schwellenwert liegt
  touchSensitivity = 0; // Reset der Sensitivität um mehrfaches Abziehen zu vermeiden
}

  // ---------------  Wenn die Pflanze berührt wird, Punkte erhöhen
  if (touchSensitivity > 0.1 && millis() - lastTouchUpdate > 5000) {
    points += 10;
    lastTouchUpdate = millis();
  }

  // ---------------  Überprüfen, ob die Bodenfeuchtigkeit niedrig ist
  if (currentMoisture === 'Low') {
    showWaterPopup = true;
  } else {
    showWaterPopup = false;
  }

  //-----  Anzeige des Popups, wenn nötig
  if (showWaterPopup) {
    fill(255, 0, 0, 150); // Halbdurchsichtiger roter Hintergrund
    rectMode(CENTER);
    rect(width / 2, height / 2, 300, 100, 10); // Popup-Fenster

    fill(255); // Weißer Text
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Please water me!", width / 2, height / 2);
  }

  //---------  Buttons der Information von der Planze !!!
  if (showInfo) {
    displayPlantInfo();
  }

 // -----  Anzeigen der Pflanzendaten, wenn topf true ist
  if (showPlantInfo) {
    displayPlantDescription();
  }

  // Überprüfen, ob die Lichtverhältnisse ungünstig sind
  if (currentLightIntensity < 20) {
    showLightPopup = 'dunkel';
  } else if (currentLightIntensity > 80) {
    showLightPopup = 'hell';
  } else {
    showLightPopup = false;
  }


  //------ Anzeige des Licht-Popups, wenn nötig
  if (showLightPopup) {
    if (showLightPopup === 'hell') {
      fill(128, 128, 128, 150); // Grauer Hintergrund für Schatten-Popup
    } else {
      fill(255, 255, 0, 150); // Gelber Hintergrund für Sonnen-Popup
    }
    noStroke();
    ellipseMode(CENTER);
    ellipse(width / 2, height / 4, 300, 150); // Runde Form für das Popup

    fill(0); // Schwarzer Text
    textSize(24);
    textAlign(CENTER, CENTER);
    let message = showLightPopup === 'dunkel' ? "Put me under the Sun!" : "Put me in the Shadow!";
    text(message, width / 2, height / 4);
  }

  // Sticker anzeigen, wenn 50 Punkte erreicht werden
  displaySticker();
  

}