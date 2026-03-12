let width;
let height;

let data;
let table;
let fileName = 'sampledata.csv';

let gradient;

let pointPosTex;
let pointColTex;

const texSize = 32;

let currentPoints = [];
let targetPoints = [];

async function preload() {
  data = await loadTable(fileName, ',', 'header');
  console.log('file loaded:', data);

  gradient = loadShader('shaders/gradient.vert', 'shaders/gradient.frag');
}

function setup() {

  width = windowWidth;
  height = windowHeight;

  createCanvas(width, height, WEBGL);

  tableize(data);

  textureizePoints();

  console.log('data length', data.rows.length);

}

function windowResized() {

  width = windowWidth;
  height = windowHeight;

  resizeCanvas(width, height);

}

function draw() {

  updatePoints();

  textureizePoints();

  drawGradient(table, -200, -200, 400, 400);

}

function tableize(data) {

  table = [];

  for (let i = 0; i < data.rows.length; i++) {

    let x = parseFloat(data.rows[i].arr[0]);
    let y = parseFloat(data.rows[i].arr[1]);
    let colHex = data.rows[i].arr[2];

    let col = hexToRgb(colHex);

    table.push([x, y, colHex]);

    currentPoints.push({
      x: x,
      y: y,
      col: [...col]
    });

    targetPoints.push({
      x: random(),
      y: random(),
      col: [random(255), random(255), random(255)]
    });

  }

  console.log('table initialized', table);

}

function hexToRgb(hex) {

  hex = hex.replace('#', '');

  let bigint = parseInt(hex, 16);

  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return [r, g, b];

}

function updatePoints() {

  for (let i = 0; i < currentPoints.length; i++) {

    let p = currentPoints[i];
    let t = targetPoints[i];

    p.x = lerp(p.x, t.x, 0.02);
    p.y = lerp(p.y, t.y, 0.02);

    p.col[0] = lerp(p.col[0], t.col[0], 0.02);
    p.col[1] = lerp(p.col[1], t.col[1], 0.02);
    p.col[2] = lerp(p.col[2], t.col[2], 0.02);

    if (dist(p.x, p.y, t.x, t.y) < 0.01) {

      t.x = random();
      t.y = random();
      t.col = [random(255), random(255), random(255)];

    }

  }

}

function textureizePoints() {

  pointPosTex = createGraphics(texSize, 1);
  pointPosTex.pixelDensity(1);
  pointPosTex.loadPixels();

  pointColTex = createGraphics(texSize, 1);
  pointColTex.pixelDensity(1);
  pointColTex.loadPixels();

  for (let i = 0; i < texSize; i++) {

    let idx = i * 4;

    if (i < currentPoints.length) {

      let p = currentPoints[i];

      let x = map(p.x, 0, 1, 0, 255);
      let y = map(p.y, 0, 1, 0, 255);

      pointPosTex.pixels[idx + 0] = 255;
      pointPosTex.pixels[idx + 1] = x;
      pointPosTex.pixels[idx + 2] = y;
      pointPosTex.pixels[idx + 3] = 255;

      pointColTex.pixels[idx + 0] = p.col[0];
      pointColTex.pixels[idx + 1] = p.col[1];
      pointColTex.pixels[idx + 2] = p.col[2];
      pointColTex.pixels[idx + 3] = 255;

    } else {

      for (let j = 0; j < 4; j++) {

        pointPosTex.pixels[idx + j] = 0;
        pointColTex.pixels[idx + j] = 0;

      }

    }

  }

  pointPosTex.updatePixels();
  pointColTex.updatePixels();

}

function drawGradient(table, x = -100, y = -100, w = 100, h = 100) {

  clear();

  shader(gradient);

  gradient.setUniform('u_pointPosTex', pointPosTex);
  gradient.setUniform('u_pointColTex', pointColTex);
  gradient.setUniform('u_pointTexSize', [texSize]);

  quad(
    2 * x / width,
    2 * y / height,
    2 * (w + x) / width,
    2 * y / height,
    2 * (w + x) / width,
    2 * (h + y) / height,
    2 * x / width,
    2 * (h + y) / height
  );

}

function test(){

  texture(pointPosTex);
  rect(-200, -200, 400, 400);

}