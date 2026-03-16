/*
point gradient shader:

1
put shaders file into same folder as index.html
put: "<script src="shaders/jsgradient.js"></script>"  into html head

2
to use:
create a WEBGL canvas with: "createCanvas(width, height, WEBGL)"
and a gradient buffer of same size: "gradientBuffer = createGraphics(width, height, WEBGL)"
note: if canvas size is adjested, gradient buffer size should be adjusted too

run loadGradient(table)
table in format of array of arrays e.g. [[x, y, hex], [x, y, hex], .....] -- x and y in range (0 to 1)

run drawGradient(x position, y position, width, height, value 1, value 2, value 3, value 4)
x and y positions are in WEBGL canvas format
values 1 - 4 are for extra control, not necessary but may be adjusted as desired for change in look
*/




let width, height;
let data, table;
//let fileName = 'sampledata.csv';  // columns [0], [1], [2]
let fileName = 'data1.csv';         // columns [8] split by " " / 100, ([13] * 0.5), [6]

let fileName1 = 'data2.csv';        // columns [8] split by " " / 100, ([13] * 0.5), [6]
let data1;                          // alt data  

// for sliders - not necessary
let s1, s1v;
let s2, s2v;
let s3, s3v;
let s4, s4v;

async function preload() {                                 // here data csv is preloaded before running
  data = await loadTable(fileName, ',', 'header');

  data1 = await loadTable(fileName1, ',', 'header');        // alt data for switching

  gradient = loadShader('shaders/gradient.vert', 'shaders/gradient.frag');
  effect = loadShader('shaders/effect.vert', 'shaders/effect.frag');
}

function setup() {
  width = windowWidth;
  height = windowHeight;

  createCanvas(width, height, WEBGL);                       // must use WEBGL canvas
  gradientBuffer = createGraphics(width, height, WEBGL);    // also necessary as 2 shaders are running

  tableize(data);                                            // turns csv into array of arrays
  console.log('data length', table.length);
  console.log('data', table);
  loadGradient(table);                                       // takes in array of arrays e.g. [[x, y, hex], [x, y, hex], .....] -- x and y in range (0 to 1)

  // sliders -- not necessary
  s1 = createSlider(0, 1, 0.33, 0.01);
  s1.position(10, 10);
  s2 = createSlider(0, 1, 0.86, 0.01);
  s2.position(10, 40);
  s3 = createSlider(0, 1, 0.7, 0.01);
  s3.position(10, 70);
  s4 = createSlider(0, 1, 0.5, 0.01);
  s4.position(10, 100);

}

function windowResized() {                                     // resizing window -- not necessary
  width = windowWidth;
  height = windowHeight;
  resizeCanvas(width, height);
  if (gradientBuffer) gradientBuffer.resizeCanvas(width, height);
}


function tableize(data) {                                       // turns csv into array of arrays here, where csv only contains x, y and hex
                                                                // adjust for data as needed
  table = [];
  for (let i = 0; i < data.rows.length; i++) {
    table.push(
      [
      split(data.rows[i].arr[8], " ")[1] / 100,
      (data.rows[i].arr[13] * 0.5),
      data.rows[i].arr[6]
      ]
    );
  }
}



loop = 0;
function draw(){
  // sliders -- not necessary
  let s1v = s1.value();
  let s2v = s2.value();
  let s3v = s3.value();
  let s4v = s4.value();

  clear();

  drawGradient(-400, -300, 600, 600, s1v, s2v, s3v, s4v);         // drawing gradient after loadGradient()
  //drawGradient(-width / 2, -height / 2, width, height, s1v, s2v, s3v, s4v);         // drawing gradient after loadGradient()
                                                                  // IMPORTANT!!
                                                                  // loadGradient() must be run first, or if data is changed
                                                                  // IMPORTANT!!
  //gradientTest();                                               // function to display point data textures -- for testing / diagnosis

  loop++;
}

c = 0;
function keyPressed(event){
  if (key = "s" || key == "S"){
    c++;
    d = c % 2;
    console.log("data switch to ", d);
    if (d==0){
      tableize(data);                                         // main data
      loadGradient(table);
    } else {
      tableize(data1);                                        // alt data
      loadGradient(table);
    }
  }
}