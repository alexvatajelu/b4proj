let width = 600;
let height = 600;

let table;

function setup() {
  createCanvas(width, height, WEBGL);
  loadData('sampledata.csv');
}

function draw() {
  background(220);
}

async function loadData(fileName) {
    let file = await loadTable('sampledata.csv', ',', 'header');
    console.log(file);
    console.log(`rows: ${file.rows.length}`);

    table = [];
    for (let i = 0; i < file.rows.length; i++) {
      console.log(`x: ${file.rows[i].arr[0]}, y: ${file.rows[i].arr[1]}, colour: ${file.rows[i].arr[2]}`);

      table.push({
          x: file.rows[i].arr[0],
          y: file.rows[i].arr[1],
          colour: file.rows[i].arr[2]
      });
    }

    console.log("table:");
    console.log(table);
}