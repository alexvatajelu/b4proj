let width, height;

function windowResized() {
    width = windowWidth;
    height = windowHeight;
    resizeCanvas(width, height);
}

function setup() {
    width = windowWidth;
    height = windowHeight;
    createCanvas(width, height);
}

function draw() {
  background(220);

  rect (width * 0.1, height * 0.1, width * 0.8, height * 0.8);
}
