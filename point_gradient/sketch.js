let width;
let height;

let data;
let table;
let fileName = 'sampledata.csv';

let gradient;
let pointTex;


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
  textureizePoints(table);
  console.log('data length', data.rows.length);  
}

function windowResized() {
  width = windowWidth;
  height = windowHeight;
  resizeCanvas(width, height);
  i = 0;
}

let i = 0;
function draw() {
  if (i % 6000 === 0) {
    drawGradient(table,-200, -200, 400, 400);
  }
  i++;
}



function tableize(data) {
  table = [];
  for (let i = 0; i < data.rows.length; i++) {
    table.push(
      [
      data.rows[i].arr[0],
      data.rows[i].arr[1],
      data.rows[i].arr[2]
      ]
    );
  }
  console.log('table initialized', table);
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');

    var bigint = parseInt(hex, 16);

    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b];
}



function textureizePoints(table) {
  pointTex = createGraphics(2, 512);
  pointTex.pixelDensity(1);
  pointTex.loadPixels();

  for (let i = 0; i < 512; i++) {

    let idx = i * 8;

    if (i < table.length) {
      let x = map(table[i][0], 0, 100, 0, 255);
      let y = map(table[i][1], 0, 100, 0, 255);
      let col = hexToRgb(table[i][2]);

      pointTex.pixels[idx + 0] = 255;
      pointTex.pixels[idx + 1] = x;
      pointTex.pixels[idx + 2] = y;
      pointTex.pixels[idx + 3] = 255;

      pointTex.pixels[idx + 4] = col[0];
      pointTex.pixels[idx + 5] = col[1];
      pointTex.pixels[idx + 6] = col[2];
      pointTex.pixels[idx + 7] = 255;

    } else {
      for (let j = 0; j < 8; j++) {
        pointTex.pixels[idx + j] = 0;
      }
    }
  }
  pointTex.updatePixels();
}

function drawGradient(table, x = -100, y = -100, w = 100, h = 100) {
  console.log('drawing gradient at:', x, y, 'with dimensions:', w, h);
  clear();
  
  shader(gradient);
  gradient.setUniform('u_pointTex', pointTex);

  //gradient.setUniform('u_bounds', [x, y, width, height]);

  //quad(-0.5, -1, 1, -1, 0.5, 1, -1, 1);
  quad(2 * x / width, 2 * y / height, 2 * (w + x) / width, 2 * y / height, 2 * (w + x) / width, 2 * (h + y) / height, 2 * x / width, 2 * (h + y) / height);
  //rect(0,0,10,10);
}