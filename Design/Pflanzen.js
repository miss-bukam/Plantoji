let greenColors = "cdf2ba-77af5b-76a855-c4e878-e8f78a-dded63-f1f4e6".split("-").map(a => "#" + a);
let redColors = "ffcccc-ff9999-ff6666-ff3333-ff0000-cc0000-990000".split("-").map(a => "#" + a);
let clickThreshold = 10;
let clickCount = 0;
let isRed = false;
let lastClickTime = 0;
let resetTime = 2000;  
let freqExchangePoints = 0;
let backgroundMusic;


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

// Laden der Musikdatei
function preload() {
  soundFormats('mp3', 'ogg');
  backgroundMusic = loadSound('Deep_in_the_Forest.mp3');
}

let musicButton;
let infoButton;
let specificLeaf; // Spezifisches Blatt

// Initialisierung
function setup() {
  frameRate(10);
  createCanvas(windowWidth, windowHeight);
  let currentTime = hour();

  // Hintergrundfarbe basierend auf die Tageszeit 
  if (currentTime >= 6 && currentTime < 12) {
    // Morgen: Gelb
    background(255, 255, 0);
  } else if (currentTime >= 12 && currentTime < 18) {
    // Tag: Hellblau
    background(173, 216, 230);
  } else if (currentTime >= 18 && currentTime < 21) {
    // Abend: Orange
    background(255, 165, 0);
  } else {
    // Nacht: Dunkelblau
    background(25, 25, 112);
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

  // Musik abspielen
  backgroundMusic.loop();
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

// Zeichnen
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

}

// Musik abspielen oder stoppen
function toggleMusic() {
  if (backgroundMusic.isPlaying()) {
    backgroundMusic.stop();
    musicButton.style('color', 'gray');
  } else {
    backgroundMusic.loop();
    musicButton.style('color', 'white');
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
}
