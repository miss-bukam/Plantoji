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
let showSunPopup = false;

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

let plantImages = [];

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

//--------------Preload Methode----------------------------
function preload() {
  soundFormats('mp3', 'ogg');
  happyMusic = loadSound('mp3/Deep_in_the_Forest.mp3');
  angryMusic = loadSound('mp3/READY_TO_FIGHT.mp3');
  
  // Für die Bilder in der Infobox
  plantImages.push(loadImage('images/Bild1.jpeg', () => {
    console.log('Bild 1 erfolgreich geladen');
  }, (err) => {
    console.error('Fehler beim Laden des Bildes 1:', err);
  }));

  plantImages.push(loadImage('images/Bild2.jpeg', () => {
    console.log('Bild 2 erfolgreich geladen');
  }, (err) => {
    console.error('Fehler beim Laden des Bildes 2:', err);
  }));
  
  plantImages.push(loadImage('images/Bild3.jpeg', () => {
    console.log('Bild 3 erfolgreich geladen');
  }, (err) => {
    console.error('Fehler beim Laden des Bildes 3:', err);
  }));
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
  infoButton = createButton('\u2665'); // Herz-Symbol
  infoButton.position(width - 90, 20); // Position des Info-Buttons oben rechts
  infoButton.size(50, 50);
  infoButton.style('font-size', '30px');
  infoButton.style('background-color', 'gray'); // Grau als Standardfarbe
  infoButton.style('border', '2px solid gray');
  infoButton.style('border-radius', '25px');
  infoButton.style('color', 'white');
  infoButton.style('text-shadow', '1px 2px 3px black');
  infoButton.style('box-shadow', '2px 2px 10px rgba(0, 0, 0, 0.5)');
  infoButton.style('cursor', 'pointer');
  infoButton.mousePressed(toggleInfo);
  
}

function displayPlantInfo() {
  const x = width - 300;
  const y = 190;
  const boxWidth = 350;
  const boxHeight = 230; // Height adjusted for better spacing
  const padding = 20;

  // Background for the info box
  fill(255); // White background
  stroke(200); // Light grey border
  strokeWeight(2);
  rectMode(CENTER);
  rect(x, y, boxWidth, boxHeight, 20); // Rounded corners

  // Title
  fill(0);
  textSize(22);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text('Plant Status', x, y - boxHeight / 2 + padding);

  textSize(16);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);

  let infoY = y - boxHeight / 2 + padding * 3.5;

  function displayInfoLine(label, value) {
    const spacing = '    '; // Four spaces for larger spacing
    fill('#4a752c'); // Dark green for label
    textStyle(BOLD);
    text(label + ": " + spacing, x - boxWidth / 2 + padding, infoY);
    fill(0); // Black for value
    textStyle(NORMAL);
    text(value, x - boxWidth / 2 + padding + textWidth(label + ": " + spacing), infoY);
    infoY += 24; // Increase line height for spacing
  }

  displayInfoLine("Touch Sensitivity", touchSensitivity);
  displayInfoLine("Pot Touch", topf);
  displayInfoLine("Temperature", currentTemperature + " °C");
  displayInfoLine("Humidity", currentHumidity + " %");
  displayInfoLine("Moisture", currentMoisture);
  displayInfoLine("Mood", isRed ? 'Angry' : 'Happy');
}

function toggleInfo() {
  showInfo = !showInfo;
  if (showInfo) {
    infoButton.style('background-color', '#76a855'); // Grün bei Aktivierung
    infoButton.style('border', '2px solid #76a855');
  } else {
    infoButton.style('background-color', 'gray'); // Grau bei Deaktivierung
    infoButton.style('border', '2px solid gray');
  }
  
  // Beim Klicken auf den Herz-Button die Smiley-Umrandungen ändern
  if (showInfo) {
    smileyOutlineColor = 'white'; // Umrandung auf weiß setzen
  } else {
    smileyOutlineColor = 'black'; // Zurück auf schwarz setzen, wenn Info deaktiviert wird
  }
}

// Funktion für die Infobox alls Pot angefasst wird
function displayPlantDescription() {
  const x = width - 300;
  const y = height - 350;
  const boxWidth = 520;
  const boxHeight = 610; // Erhöhen Sie die Höhe, um Platz für das Bild zu schaffen
  const padding = 10;
  const titlePadding = 40;
  const spaceAfterColon = '   '; // Mehrere Leerzeichen

  // Hintergrund für die Info-Box
  fill(255); // Weißer Hintergrund
  noStroke();
  rectMode(CENTER);
  // Umrandung der Info-Box mit abgerundeten Ecken
  rect(x, y, boxWidth, boxHeight, 20);

  // Bilder der Pflanze
  imageMode(CENTER);
  if (plantImages.length > 0) {
    const imgY = y - boxHeight / 2 + padding + 75;
    image(plantImages[0], x - 150, imgY, 150, 150); // Erstes Bild links
    if (plantImages.length > 1) {
      image(plantImages[1], x, imgY, 150, 150); // Zweites Bild in der Mitte
      if (plantImages.length > 2) {
        image(plantImages[2], x + 150, imgY, 150, 150); // Drittes Bild rechts
      }
    }
  } else {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('Bilder konnten nicht geladen werden.', x, y - boxHeight / 2 + padding + 75);
  }

  // Titel
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  text('Plant Information', x, y - boxHeight / 2 + padding + 170); // 170, um das Bild zu berücksichtigen

  textSize(18);
  textAlign(LEFT, TOP);
  let currentY = y - boxHeight / 2 + padding * 3 + titlePadding + 170; // 170, um das Bild zu berücksichtigen

  function addTextSection(title, content) {
    fill(0);
    textSize(20);
    text(title, x - boxWidth / 2 + padding, currentY);
    currentY += 30;
    textSize(16);
    content.forEach(line => {
      const splitIndex = line.indexOf(':');
      if (splitIndex !== -1) {
        const key = line.substring(0, splitIndex + 1);
        const value = line.substring(splitIndex + 1).trim();

        fill('#4a752c'); // Dunkelgrün für das Wort vor dem Doppelpunkt
        textStyle(BOLD); // Fett für das Wort vor dem Doppelpunkt
        text(key + spaceAfterColon, x - boxWidth / 2 + padding, currentY); // Mehrere Leerzeichen hinzufügen

        fill(0); // Schwarz für den Rest des Textes
        textStyle(NORMAL); // Normal für den Rest des Textes
        text(value, x - boxWidth / 2 + padding + textWidth(key + spaceAfterColon), currentY);
      } else {
        fill(0);
        textStyle(NORMAL); // Normal für den Rest des Textes
        text(line, x - boxWidth / 2 + padding, currentY);
      }
      currentY += 20;
    });
    currentY += 20; // Abstand zwischen den Abschnitten
  }

  addTextSection('Origin', [
    'Origin: New Guinea and Australia',
    'Family: Araliaceae',
    'Subfamily: Aralioideae',
    'Genus: Schefflera',
    'Species: Schefflera actinophylla'
  ]);

  addTextSection('Characteristics', [
    'Growth Type: Tree',
    'Flower Shape: Racemes',
    'Leaf Shape: Palmately compound, long-stalked, oblong-ovate, acute',
    'Fruit Type: Drupe',
    'Ornamental Value: Foliage plant',
    'Growth Habit: Erect',
    'Leaf Color: Green',
    'Fruit Color: Red'
  ]);
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
  if (points >= lastStickerPoint + stickerInterval && !stickerPoints.includes(lastStickerPoint + stickerInterval)) {
    stickerPoints.push(lastStickerPoint + stickerInterval); // Füge den nächsten Sticker-Punkt zum Array hinzu
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

// ---------------------   ALLE MOCKFUNKTIONEN        -----------------------
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

  particles = particles.filter(p => !p.dead); // Entfernen Sie die toten Partikel

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
  fill(255)
  text(`Frequence Exchange points: ${points}`, 20, 20);

  // --------------- Überprüfen, ob die Pflanze zu stark angefasst wird
  if (touchSensitivity > highTouchThreshold) {
    points -= 5; // Punkte reduzieren, wenn die Sensitivität über dem Schwellenwert liegt
    touchSensitivity = 0; // Reset der Sensitivität um mehrfaches Abziehen zu vermeiden
  }

  // --------------- Wenn die Pflanze berührt wird, Punkte erhöhen
  if (touchSensitivity > 0.1 && millis() - lastTouchUpdate > 5000) {
    points += 10;
    lastTouchUpdate = millis();
  }

  // --------------- Überprüfen, ob die Bodenfeuchtigkeit niedrig ist
  if (currentMoisture === 'Low') {
    showWaterPopup = true;
  } else {
    showWaterPopup = false;
  }

  // Mood auf angry setzen oder zurücksetzen
  if (showWaterPopup || showLightPopup || showSunPopup) {
    isRed = true;
  } else {
    isRed = false;
  }

  // Anzeige der standardmäßig grauen Popups
  drawGrayPopups();

  // Anzeige der Popups, wenn sie getriggert werden
  if (showWaterPopup) {
    drawWaterPopup();
    isRed = true; // Mood auf angry setzen
  }
  if (showLightPopup) {
    drawLightPopup();
    isRed = true; // Mood auf angry setzen
  }
  if (showSunPopup) {
    drawSunPopup();
    isRed = true; // Mood auf angry setzen
  }

  //--------- Buttons der Information von der Planze !!!
  if (showInfo) {
    displayPlantInfo();
  }

  // ----- Anzeigen der Pflanzendaten, wenn topf true ist
  if (showPlantInfo) {
    displayPlantDescription();
  }

  // Überprüfen, ob die Lichtverhältnisse ungünstig sind
  if (currentLightIntensity < 20) {
    showLightPopup = true;
  } else if (currentLightIntensity > 80) {
    showSunPopup = true;
  } else {
    showLightPopup = false;
    showSunPopup = false;
  }

  // Sticker anzeigen, wenn 50 Punkte erreicht werden
  displaySticker();

  // Smiley anzeigen basierend auf der Stimmung
  displaySmiley();
}

function drawGrayPopups() {
  // Zeichnet graue Platzhalter-Popups
  fill(128, 128, 128, 150); // Grauer Hintergrund
  noStroke();
  rectMode(CENTER);

  // Platzhalter für Wasser-Popup
  fill(128, 128, 128);
  rect(width / 2, height / 2 - 200, 300, 100, 10); // Adjusted vertical position
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("💧 Please water me!", width / 2, height / 2 - 200);

  // Platzhalter für Licht-Popup (Schatten)
  fill(128, 128, 128); // Grauer Hintergrund für deaktiviertes Popup
  rect(width / 2, height / 2, 300, 100, 10); // Adjusted vertical position
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("❄️ Put me in the Shadow!", width / 2, height / 2);

  // Platzhalter für Licht-Popup (Sonne)
  fill(128, 128, 128); // Grauer Hintergrund für deaktiviertes Popup
  rect(width / 2, height / 2 + 200, 300, 100, 10); // Adjusted vertical position
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("☀️ Put me under the Sun!", width / 2, height / 2 + 200);
}

function drawWaterPopup() {
  fill(255, 0, 0, 150); // Roter Hintergrund
  rectMode(CENTER);
  rect(width / 2, height / 2 - 200, 300, 100, 10); // Adjusted vertical position

  fill(255); // Weißer Text
  textSize(24);
  textAlign(CENTER, CENTER);
  text("💧 Please water me!", width / 2, height / 2 - 200);
}

function drawLightPopup() {
  fill(255, 0, 0, 150); // Dunkelblauer Hintergrund für Schatten-Popup
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2, 300, 100, 10); // Adjusted vertical position

  fill(255); // Weißer Text
  textSize(24);
  textAlign(CENTER, CENTER);
  text("❄️ Put me in the Shadow!", width / 2, height / 2);
}

function drawSunPopup() {
  fill(0, 0, 128, 150); // Dunkelgelber Hintergrund für Sonnen-Popup
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2 + 200, 300, 100, 10); // Adjusted vertical position

  fill(255); // Weißer Text
  textSize(24);
  textAlign(CENTER, CENTER);
  text("☀️ Put me under the Sun!", width / 2, height / 2 + 200);
}

let smileyOutlineColor = 'black';

// Funktion zum Anzeigen eines Smileys basierend auf der Stimmung
function displaySmiley() {
  let smileyX = 300; // Smiley nach links verschieben
  let smileyY = height / 2;
  let smileySize = 300; // Größere Größe für den Smiley
  let eyeSize = 20;

  // Smiley-Gesicht
  if (isRed) {
    fill(0, 0, 255); // Blau für traurigen Smiley
  } else {
    fill(255, 255, 0); // Gelb für glücklichen Smiley
  }
  
  stroke('black')
  strokeWeight(4);
  ellipse(smileyX, smileyY, smileySize);
  
  // Augen
  fill(0);
  ellipse(smileyX - smileySize / 4, smileyY - smileySize / 4, eyeSize);
  ellipse(smileyX + smileySize / 4, smileyY - smileySize / 4, eyeSize);

  // Mund
  stroke('black'); // Umrandung in der festgelegten Farbe zeichnen

  
  noFill();
  stroke('black');
  strokeWeight(4);

  if (isRed) {
    // Trauriger Gesichtsausdruck
    arc(smileyX, smileyY, smileySize / 2, smileySize / 2, PI, 0, OPEN);
  } else {
    // Glücklicher Gesichtsausdruck
    arc(smileyX, smileyY, smileySize / 2, smileySize / 2, 0, PI, CHORD);
  }
}
