let width, height;

function setup() {
    width = windowWidth;
    height = windowHeight;
    createCanvas(width, height);
}

function draw() {
  background(220);
}

function windowResized() {
    width = windowWidth;
    height = windowHeight;
    resizeCanvas(width, height);
}