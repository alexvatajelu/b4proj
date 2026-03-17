let gPos = [-400,-300,900,600];               //place anywhere
let fullscreen = 1;                           //or use fullscreen

let width, height;
let data, table;

//let folder = 'iceland_assorted';
let folder = 'othercsvnoimg';
let csvname = 'data (1)';
let priceRange = [0,1];                       //customise to fit scale of data price range

let s1, s1v;
let s2, s2v;
let s3, s3v;
let s4, s4v;

let imgs = [];
let s = 1;

let myFont;

async function preload() {
  data = await loadTable(folder + '/' + csvname + '.csv', ',', 'header');

  myFont = await loadFont('NeueMontreal-Medium.otf');

  console.log("data loaded");

  gradient = loadShader('shaders/gradient.vert', 'shaders/gradient.frag');
  effect = loadShader('shaders/effect.vert', 'shaders/effect.frag');
}

function setup() {
  width = windowWidth;
  height = windowHeight;
  
  if (fullscreen){gPos = [-width/2,-height/2,width,height]}

  createCanvas(width, height, WEBGL);
  gradientBuffer = createGraphics(width, height, WEBGL);

  console.log("canvas created");

  tableize(data);

  console.log('data length', table.length);
  console.log('data', table);
  loadGradient(table, priceRange);


  if (s){
    s1 = createSlider(0, 1, 0.1, 0.01);
    s1.position(10, 10);
    s2 = createSlider(0, 1, 0.13, 0.01);
    s2.position(10, 40);
    s3 = createSlider(0, 1, 0.4, 0.01);
    s3.position(10, 70);
    s4 = createSlider(0, 1, 0.45, 0.01);
    s4.position(10, 100);
  } else {
    s1v = 0.1;
    s2v = 0.13;
    s3v = 0.4;
    s4v = 0.45;
  }
  
}

function windowResized() {
  width = windowWidth;
  height = windowHeight;
  if (fullscreen){gPos = [-width/2,-height/2,width,height]}
  resizeCanvas(width, height);
  if (gradientBuffer) gradientBuffer.resizeCanvas(width, height);
}


function tableize(data) {

  table = [];
  for (let i = 0; i < data.rows.length; i++) {
    if (data.rows[i].arr[0]){
    table.push(       // hsl s, affordab, hex, name, jpg
        [
          /*
        split(data.rows[i].arr[8], " ")[1] / 100,
        ((data.rows[i].arr[13]- priceRange[0]) / (priceRange[1] - priceRange[0])),
        data.rows[i].arr[6],
        data.rows[i].arr[0],
        data.rows[i].arr[1]
          */
        split(data.rows[i].arr[2], " ")[1] / 100,
        ((data.rows[i].arr[1]- priceRange[0]) / (priceRange[1] - priceRange[0])),
        //data.rows[i].arr[2], ///turn to hsl to hex
        hslToHex(split(data.rows[i].arr[2], " ")[0],split(data.rows[i].arr[2], " ")[1],split(data.rows[i].arr[2], " ")[2]),
        data.rows[i].arr[0],
        data.rows[i].arr[0]
        ]
      );
    console.log(folder+'/'+data.rows[i].arr[0]);
      imgs.push(loadImage(folder+'/'+data.rows[i].arr[0]));
    }
    //console.log("ppp", data.rows[i].arr[13],((data.rows[i].arr[13]- priceRange[0]) / (priceRange[1] - priceRange[0])));
  }
}



loop = 0;
function draw(){
  if (s){
    s1v = s1.value();
    s2v = s2.value();
    s3v = s3.value();
    s4v = s4.value();
  }

  let amx, amy;

  clear();
  
  drawGradient(gPos[0], gPos[1], gPos[2], gPos[3], s1v, s2v, s3v, s4v);
  //drawGradient(-width / 2, -height / 2, width, height, s1v, s2v, s3v, s4v);
  const gl = drawingContext;
  gl.disable(gl.DEPTH_TEST);

  
  push();
  resetMatrix();
  resetShader();
  
  textFont(myFont);
  textSize(13);
  textAlign(LEFT);

  noStroke();
  fill(255);
  rect(gPos[0], gPos[1]+(gPos[3]/2)-1, gPos[2], 2);
  rect(gPos[0]+(gPos[2]/2)-1, gPos[1], 2, gPos[3]);
  
  fill(0);
  text("Price compared to average: " + priceRange[1], gPos[0]+(gPos[2]/2)+5, gPos[1]+15);
  text("Price compared to average: " + priceRange[0], gPos[0]+(gPos[2]/2)+5, gPos[1]+gPos[3]-5);
  text("Saturation: 0", gPos[0]+5, gPos[1]+(gPos[3]/2)+15);
  text("Saturation: 1", gPos[0]+gPos[2]-77, gPos[1]+(gPos[3]/2)+15);

  amx = round(constrain(((mouseX - width / 2) - gPos[0]) / gPos[2], 0, 1), 2);
  amy = round( (constrain(((mouseY - height / 2) - gPos[1]) / gPos[3], 0, 1)) * (priceRange[0] - priceRange[1]) + priceRange[1], 2);
  text('(' + amx + ', ' + amy + ')', mouseX-(width/2) + 10, mouseY-(height/2) - 5);

  //stroke(255);
  stroke(0);
  strokeWeight(1);

  let closest = [0,10000];
  let rectS = 25;
  for (let i = 0; i < table.length; i++){
    let px = map(table[i][0], 0, 1, gPos[0], gPos[0]+gPos[2]) - rectS / 2;
    let py = map(table[i][1], 0, 1, gPos[1] + gPos[3], gPos[1]) - rectS / 2;
    //let py = map(table[i][1], 0, 1, gPos[1], gPos[1]+gPos[3]) - rectS / 2;
    let pcol = color(table[i][2]);

    let ptext = (round(table[i][0]*100,2) + '%  ' + round(table[i][1] * (priceRange[1]-priceRange[0]) + priceRange[0],2) + '  ' + table[i][2]);

    let mdist = pow(pow(amx - table[i][0], 2) + pow(amy - (table[i][1] * (priceRange[1]-priceRange[0]) + priceRange[0]), 2), 0.5);
    let rescale = 2 / (mdist + 0.05);

    //stroke(255);
    fill(pcol);
    rect(px - (rescale/2), py - (rescale/2), rectS + rescale, rectS + rescale);

    fill(0);
    //text(ptext, px + rectS / 2, py - 5 - (rescale/2));
    
    if (mdist<=closest[1]){closest=[i,mdist]}
  }


    for (let i = 0; i < table.length; i++){
    let px = map(table[i][0], 0, 1, gPos[0], gPos[0]+gPos[2]) - rectS / 2;
    let py = map(table[i][1], 0, 1, gPos[1] + gPos[3], gPos[1]) - rectS / 2;
    //let py = map(table[i][1], 0, 1, gPos[1], gPos[1]+gPos[3]) - rectS / 2;
    let pcol = color(table[i][2]);

    let ptext = (round(table[i][0]*100,2) + '%  ' + round(table[i][1] * (priceRange[1]-priceRange[0]) + priceRange[0],2) + '  ' + table[i][2]);

    let mdist = pow(pow(amx - table[i][0], 2) + pow(amy - (table[i][1] * (priceRange[1]-priceRange[0]) + priceRange[0]), 2), 0.5);
    let rescale = 2 / (mdist + 0.05);

    //stroke(255);
    fill(pcol);
    //rect(px - (rescale/2), py - (rescale/2), rectS + rescale, rectS + rescale);

    fill(0);
    text(ptext, px + rectS / 2, py - 5 - (rescale/2));
    
   //if (mdist<closest[1]){closest=[i,mdist]}
  }

  //let closest = table[minIndex(rlist)];
  let exs = 8;
  if (closest[1]<0.02){
    fill(table[closest[0]][2]);
    rect(gPos[0]+gPos[2]-rectS*exs*1.2,gPos[1]+gPos[3]-rectS*exs*1.2,rectS*exs,rectS*exs);
    fill(0);
    textAlign(RIGHT);
    textSize(23);
    let text1 = (round(table[closest[0]][0]*100,2) + '%  ' + round(table[closest[0]][1] * (priceRange[1]-priceRange[0]) + priceRange[0],2) + '  ' + table[closest[0]][2]);
    let text2 = (table[closest[0]][3]);
    text(text1, gPos[0]+gPos[2]-rectS*exs*0.25,gPos[1]+gPos[3]-rectS*exs*1.3);
    text(text2, gPos[0]+gPos[2]-rectS*exs*0.25,gPos[1]+gPos[3]-rectS*exs*1.3-30);

    image (imgs[closest[0]], gPos[0]+gPos[2]-rectS*exs*0.95, gPos[1]+gPos[3]-rectS*exs*0.95,100, 100);
  }


  pop();
  gl.enable(gl.DEPTH_TEST);

  loop++;
}




// Source - https://stackoverflow.com/a/44134328
// Posted by Juraj, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-17, License - CC BY-SA 4.0

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
