let width, height;
let data, table;
let fileName = 'sampledata.csv';

let screen = 0;

let s1, s1v;
let s2, s2v;

async function preload() {
  data = await loadTable(fileName, ',', 'header');
  //console.log('file loaded:', data);
  gradient = loadShader('shaders/gradient.vert', 'shaders/gradient.frag');
}

function setup() {
  width = windowWidth;
  height = windowHeight;

  createCanvas(width, height, WEBGL);

  tableize(data);
  console.log('data length', table.length);
  console.log('data', table);

  textureizePoints(table);

  s1 = createSlider(0, 1, 0.5, 0.01);
  s1.position(10, 10);
  
  s2 = createSlider(0, 1, 0.5, 0.01);
  s2.position(10, 40);
}

function windowResized() {
  width = windowWidth;
  height = windowHeight;
  resizeCanvas(width, height);
  i = 0;
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
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');

    var bigint = parseInt(hex, 16);

    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b];
}

loop = 0;
function draw(){
  let s1v = s1.value();
  let s2v = s2.value();

  clear();

  let cases = 2;
  if(screen % cases == 0){
    drawGradient(-400, -400, 800, 800, s1v, s2v);
  } else if (screen % cases == 1){
    test();
  }
  loop++;
}



const texSize = 32;

function textureizePoints(table){

  pointPosTex = createGraphics(texSize, 1);
  pointPosTex.pixelDensity(1);
  pointPosTex.loadPixels();
  
  pointColTex = createGraphics(texSize, 1);
  pointColTex.pixelDensity(1);
  pointColTex.loadPixels();

  for (let i = 0; i < texSize; i++){
    if (i < (table.length)){
      let ix = i * 4;

      let x = float(table[i][0]);
      let y = float(table[i][1]);
      let col = hexToRgb(table[i][2]);
      console.log('row', i, 'x', x, 'y', y, 'col', col);

      pointPosTex.pixels[ix + 0] = 255;
      pointPosTex.pixels[ix + 1] = x * 255;
      pointPosTex.pixels[ix + 2] = y * 255;
      pointPosTex.pixels[ix + 3] = 255;
      
      pointColTex.pixels[ix + 0] = col[0];
      pointColTex.pixels[ix + 1] = col[1];
      pointColTex.pixels[ix + 2] = col[2];
      pointColTex.pixels[ix + 3] = 255;
      
    } else {
      for (let j = 0; j < 4; j++){
        pointPosTex.pixels[i*4 + j] = 0;
        pointColTex.pixels[i*4 + j] = 100;

        console.log('row', i, '---blank---')
      }
    }
  }

  /*
  let v = 7;

  pointColTex.pixels[v * 4 + 0] = 255;
  pointColTex.pixels[v * 4 + 1] = 0;
  pointColTex.pixels[v * 4 + 2] = 0;
  pointColTex.pixels[v * 4 + 3] = 255;
  */

  pointPosTex.updatePixels();
  pointColTex.updatePixels();

}

function drawGradient(x = -200, y = -200, w = 400, h = 400, val1 = 0.5, val2 = 0.5){
  console.log('drawing gradient at:', x, y, 'with dimensions:', w, h);

  shader(gradient);
  gradient.setUniform('u_pointPosTex', pointPosTex);
  gradient.setUniform('u_pointColTex', pointColTex);
  gradient.setUniform('u_pointTexSize', [texSize] );
  gradient.setUniform('u_extras', [val1, val2] );

  pointPosTex.textureFiltering = NEAREST;
  pointColTex.textureFiltering = NEAREST;


  /*
  gradient.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gradient.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  */

  quad(2 * x / width, 2 * y / height, 2 * (w + x) / width, 2 * y / height, 2 * (w + x) / width, 2 * (h + y) / height, 2 * x / width, 2 * (h + y) / height);
}

function test(){

  textureMode(IMAGE);
  texture(pointColTex);

  rect(-200, 0, 400, 200);

  textureMode(IMAGE);
  texture(pointPosTex); 

  rect(-200, -200, 400, 200);
  
}


function keyPressed(){
  if (key == "t"){
    screen++;
    console.log(screen);
  }
}