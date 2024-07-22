let table;
let tableData = [];
let tableHeaders = [];

let greenColors = "cdf2ba-77af5b-76a855-c4e878-e8f78a-dded63-f1f4e6".split("-").map(a => "#" + a);
let redColors = "ffcccc-ff9999-ff6666-ff3333-ff0000-cc0000-990000".split("-").map(a => "#" + a);
let clickThreshold = 7;
let clickCount = 0;
let isRed = false;
let lastClickTime = 0;
let resetTime = 2000;  
let freqExchangePoints = 0;
let happyMusic;
let angryMusic;
let isMusicButtonWhite = false;

class Particle {
  constructor(args) {
    let def = {
      p: createVector(0, 0),
      v: createVector(0, 0),
      a: createVector(0, 0),
      r: 4,
      w: 10,
      color: color(255),
      child: false,
      lastP: createVector(0, 0),
    }
    Object.assign(def, args);
    Object.assign(this, def);
  }

  draw() {
    push();
    translate(this.p.x, this.p.y);
    rotate(this.v.heading() - PI * 1.5);
    fill(this.color);

    if (random() > 0.7) {
      let count = int(random(2, 4));
      for (var i = 0; i < count; i++) {
        push();
        rotate((i * 2 - 1) / 1.2 * this.v.heading() / (1 + random(2)) * random(-1, 1) + PI * 0.5);
        fill(isRed ? random(redColors) : random(greenColors));
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

    for (var o = 0; o < this.r; o += 1) {
      let c = isRed ? color(random(redColors)) : color(random(greenColors));
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
    this.v.mult(0.99);
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

let particles = [];

function preload() {
  console.log("Loading CSV...");
  try {
    table = loadTable('output.csv', 'csv', 'header', function() {
      console.log("CSV loaded successfully");
    }, function() {
      console.error("Error loading CSV");
    });
  } catch (e) {
    console.error("Exception while loading CSV: ", e);
  }
  
  soundFormats('mp3', 'ogg');
  happyMusic = loadSound('sketch_240722c/Deep_in_the_Forest.mp3', loaded('happyMusic'), loadError('happyMusic'));
  angryMusic = loadSound('sketch_240722c/READY_TO_FIGHT.mp3', loaded('angryMusic'), loadError('angryMusic'));

}

function loaded() {
  console.log('Sound loaded successfully');
}

function loadError(err) {
  console.error('Error loading sound:', err);
}
let musicButton;
let infoButton;
let specificLeaf; // Spezifisches Blatt


// Farben für verschiedene Tageszeiten
let morningColors = ["#B0E0E6", "#FFD700"]; // Gelb
let dayColors = ["#1874CD", "#B0E0E6"]; // Hellblau
let eveningColors = ["#8470FF", "#FF7F24"]; // Orange
let nightColors = ["#191970", "#000080"]; // Dunkelblau

// Funktion zum Zeichnen eines Farbverlaufs
function drawGradient(c1, c2) {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(c1), color(c2), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function setup() {
  frameRate(10);
  createCanvas(windowWidth, windowHeight);
  let currentTime = hour();

  // Hintergrundfarbe basierend auf die Tageszeit 
  if (currentTime >= 6 && currentTime < 12) {
    // Morgen: Gelb
    drawGradient(morningColors[0], morningColors[1]);
  } else if (currentTime >= 12 && currentTime < 18) {
    // Tag: Hellblau
    drawGradient(dayColors[0], dayColors[1]);
  } else if (currentTime >= 18 && currentTime < 21) {
    // Abend: Orange
    drawGradient(eveningColors[0], eveningColors[1]);
  } else {
    // Nacht: Dunkelblau
    drawGradient(nightColors[0], nightColors[1]);
  }
  fill("#222");
  noStroke();
  
  drawingContext.shadowColor = color(30, 70, 80, 235);
  drawingContext.shadowBlur = 20;
  for (var i = 0; i < 50; i++) generateNewBamboo();
  
  // Spezifisches Blatt erstellen
  specificLeaf = new Particle({
    p: createVector(width / 2, height / 2),
    v: createVector(random(-6, 6), random(-30, -100)),
    r: random(8, 18),
    w: random(20, 30),
    color: color("#76a855") // Eine grüne Farbe für das Blatt
  });
  particles.push(specificLeaf);

  // Musiksymbol erstellen
  musicButton = createButton('♫');
  musicButton.position(width - 90, 20);
  musicButton.size(50, 50);
  musicButton.style('font-size', '50px');
  musicButton.style('background-color', 'transparent');
  musicButton.style('border', 'none');
  musicButton.style('color', 'gray');
  musicButton.style('text-shadow', '1px 2px 3px black');
  musicButton.style('z-index', '10'); // Sicherstellen, dass der Button über der Leinwand liegt
  musicButton.mousePressed(toggleMusic);

  // Info-Symbol erstellen
  infoButton = createButton('i');
  infoButton.position(width - 150, 20);
  infoButton.size(50, 50);
  infoButton.style('font-size', '50px');
  infoButton.style('background-color', 'transparent');
  infoButton.style('border', 'none');
  infoButton.style('color', 'gray');
  infoButton.style('text-shadow', '1px 2px 3px black');
  infoButton.mousePressed(openInfoWindow);

  console.log("Setup started...");
  if (table) {
    console.log(table.getRowCount() + ' total rows in table');
    console.log(table.getColumnCount() + ' total columns in table');
    tableHeaders = table.columns;
    loadLastRow();
  } else {
    console.log("Table not loaded");
  }
}

function loadLastRow() {
  try {
    let lastRow = table.getRowCount() - 1;
    let rowData = [];
    for (let c = 0; c < table.getColumnCount(); c++) {
      let cellValue = table.getString(lastRow, c);
      if (cellValue !== undefined) {
        rowData.push(cellValue);
        console.log(`Row ${lastRow} Column ${c}: ${cellValue}`);
      } else {
        console.warn(`Row ${lastRow} Column ${c} is undefined`);
        rowData.push("");
      }
    }
    tableData.push(rowData);
  } catch (e) {
    console.error("Error loading last row: ", e);
  }
}

function openInfoWindow() {
  var infoWindow = document.getElementById('infoWindow');
  if (infoWindow.style.display === 'block') {
    infoWindow.style.display = 'none';
    infoButton.style('color', 'gray'); // Ändert die Farbe des Info-Buttons
  } else {
    infoWindow.style.display = 'block';
    infoButton.style('color', 'white'); // Ändert die Farbe des Info-Buttons
  }
}

function closeInfoWindow() {
  document.getElementById('infoWindow').style.display = 'none';
  infoButton.style('color', 'gray');
}

// Partikel erstellen
function generateNewBamboo() {
  let p = new Particle({
    p: createVector(random(width), height + random(50, 100)),
    v: createVector(random(-6, 6), random(-30, -100)),
    r: random(8, 18),
    w: random(20, 30),
    color: isRed ? color(random(redColors)) : random(greenColors)
  });
  if (random() < 0.1) {
    p.v.mult(0.5);
    p.r *= 3;
    p.child = true;
    p.color = isRed ? color(random(redColors)) : color("#e5c677");
  }
  particles.push(p);
}

function draw() {
   particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  particles = particles.filter(p => random() < 0.99 && !p.dead);
  if (frameCount % 20 == 0) {
    fill(0, 1);
    rect(0, 0, width, height);
    for (var i = 0; i < 2; i++) generateNewBamboo();
  }

  // Überprüfen, ob genug Zeit vergangen ist, um die Farbe zurückzusetzen
  if (isRed && millis() - lastClickTime > resetTime) {
    isRed = false;
    clickCount = 0;
  }
  // Anzeige der Frequency Exchange Points
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Frequency Exchange Points: " + freqExchangePoints, 30, 30);
  
  displaySticker();
  displaySpeechBubble();
  fill(color(204, 255, 204))
  text('Lade Sensoren-Daten', 30, 70);

  drawTable();
}

// Musik abspielen oder stoppen
function toggleMusic() {
  console.log('toggleMusic function called'); // Füge dies hinzu
  if (happyMusic && angryMusic) {
    if (happyMusic.isPlaying() || angryMusic.isPlaying()) {
      console.log('Stopping music'); // Füge dies hinzu
      happyMusic.stop();
      angryMusic.stop();
      musicButton.style('color', 'gray');
      isMusicButtonWhite = false;
    } else {
      console.log('Starting happyMusic'); // Füge dies hinzu
      happyMusic.loop();
      musicButton.style('color', 'white');
      isMusicButtonWhite = true;
    }
  } else {
    console.error('Music files not loaded properly');
  }
}

function drawTable(xOffset = 30, yOffset = 120, textColor = color(255), headerColor = color(204, 255, 204)) {
  textSize(15);
  fill(headerColor);

  // Draw table headers
  for (let c = 0; c < tableHeaders.length; c++) {
    text(tableHeaders[c], xOffset + c * 200, yOffset);
  }

  textSize(12)
  fill(textColor);
  // Draw the last row
  if (tableData.length > 0) {
    let rowData = tableData[0];
    for (let c = 0; c < rowData.length; c++) {
      text(rowData[c], xOffset + c * 200, yOffset + 30);
    }
  }
}

// MousePressed Event
function mousePressed() {
  freqExchangePoints++; 
  clickCount++;
  lastClickTime = millis();
  if (clickCount >= clickThreshold) {
    isRed = true;
  }
  
  // Überprüfen, ob das spezifische Blatt berührt wurde
  if (dist(mouseX, mouseY, specificLeaf.p.x, specificLeaf.p.y) < specificLeaf.r) {
    openInfoWindow();
  }

  for (var i = 0; i < 5; i++) generateNewBamboo();
  
  // Überprüfen, ob die schöne Musik läuft und der Benutzer heftig auf den Bildschirm klickt
  if (happyMusic && happyMusic.isPlaying()) {
    if (mouseX > width / 4 && mouseX < (width * 3) / 4 && mouseY > height / 4 && mouseY < (height * 3) / 4) {
      happyMusic.stop();
      if (angryMusic && !angryMusic.isPlaying()) {
        angryMusic.loop();
      }
    }
  }

  // Überprüfen, ob auf den Musikbutton geklickt wurde und die Farbe ändern
  if (mouseX > musicButton.position().x && mouseX < musicButton.position().x + musicButton.size().width &&
      mouseY > musicButton.position().y && mouseY < musicButton.position().y + musicButton.size().height) {
    isMusicButtonWhite = !isMusicButtonWhite;
    musicButton.style('color', isMusicButtonWhite ? 'white' : 'gray');
    console.log('Music button pressed'); // Füge dies hinzu

  }
}

// Sticker anzeigen, wenn 50 Frequency Exchange Points erreicht werden
function displaySticker() {
  if (freqExchangePoints >= 50) {
    // Sticker zeichnen
    fill("#FFD700");
    rect(20, height - 680, 60, 60, 40);
    textSize(20);
    fill("#222");
    textAlign(CENTER, CENTER);
    textAlign(LEFT, CENTER);
    text("50", 40, height - 650);
  }
}

// Sprechblase anzeigen, wenn 50 Frequency Exchange Points erreicht werden
function displaySpeechBubble() {
  if (freqExchangePoints >= 50) {
    let bubbleWidth = 250;
    let bubbleHeight = 100;
    let bubbleX = (windowWidth - bubbleWidth) / 2;
    let bubbleY = (windowHeight - bubbleHeight) / 2;

    // Sprechblase zeichnen
    fill("#EEB422");
    noStroke("#EEB422");
    rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 40);

    // Text in der Sprechblase anzeigen
    textAlign(CENTER, CENTER);
    textSize(16);
    fill("#FFFFFF");
    noStroke();
    text("50 Frequence Exchange Punkte gewonnen!", bubbleX, bubbleY, bubbleWidth, bubbleHeight);
  }
}

// Serielle Daten empfangen
function serialEvent() {
  let inData = serial.readLine().trim();
  if (inData.length > 0) {
    latestData = inData;
  }
}

// Serielle Daten anzeigen
function displaySerialData() {
  fill(255);
  textSize(16);
  text(latestData, 30, 60);

  if (latestData.includes("zu feucht")) {
    text("Bitte nicht mehr gießen", 50, 100);
  } else if (latestData.includes("perfekt")) {
    text("Mir geht es gut", 50, 100);
  } else if (latestData.includes("zu trocken")) {
    text("Ich habe Durst", 50, 100);
  } else {
    text("Warte auf Daten...", 50, 100);
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
}
