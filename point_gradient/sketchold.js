let width;
let height;

let data;
let table;
let fileName = 'sampledata.csv';

let gradient;
let pointPosTex;
let pointColTex;

const texSize = 32;

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
    //test();
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
  pointPosTex = createGraphics(texSize, 1);
  pointPosTex.pixelDensity(1);
  pointPosTex.loadPixels();
  
  pointColTex = createGraphics(texSize, 1);
  pointColTex.pixelDensity(1);
  pointColTex.loadPixels();

  for (let i = 0; i < texSize; i++) {

    let idx = i * 4;

    if (i < table.length) {
      let x = map(table[i][0], 0, 1, 0, 255);
      let y = map(table[i][1], 0, 1, 0, 255);
      let col = hexToRgb(table[i][2]);
      //let col = [0,0,0];//hexToRgb(table[i][2]);

      pointPosTex.pixels[idx + 0] = 255;
      pointPosTex.pixels[idx + 1] = x;
      pointPosTex.pixels[idx + 2] = y;
      pointPosTex.pixels[idx + 3] = 255;

      pointColTex.pixels[idx + 0] = col[0];
      pointColTex.pixels[idx + 1] = col[1];
      pointColTex.pixels[idx + 2] = col[2];
      pointColTex.pixels[idx + 3] = 255;

      console.log(`point ${i}: x=${x}, y=${y}, color=(${col[0]}, ${col[1]}, ${col[2]})`);
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
  console.log('drawing gradient at:', x, y, 'with dimensions:', w, h);
  clear();
  
  shader(gradient);
  gradient.setUniform('u_pointPosTex', pointPosTex);
  gradient.setUniform('u_pointColTex', pointColTex);
  gradient.setUniform('u_pointTexSize', [texSize] );
  //gradient.setUniform('u_bounds', [x, y, width, height]);


  //quad(-1, -1, 1, -1, 1, 1, -1, 1);
  //quad(-0.5, -1, 1, -1, 0.5, 1, -1, 1);
  quad(2 * x / width, 2 * y / height, 2 * (w + x) / width, 2 * y / height, 2 * (w + x) / width, 2 * (h + y) / height, 2 * x / width, 2 * (h + y) / height);
  //rect(0,0,10,10);
}

function test(){
  texture(pointPosTex);
  rect(-200, -200, 400, 400);
}