let table;
let fileName = 'sampledata.csv';

function setup() {
    createCanvas(800, 600, WEBGL);
    background(220);
}

function draw() {
}

function gradient(data, x, y, w, h) {
    console.log("drawing gradient");
    noStroke();
    fill(255);
    rect(x, y, w, h);

    console.log("complete");
}

function points(data, x, y, w, h) {
    console.log("drawing points");
    noStroke();
    fill(255);
    rect(x, y, w, h);

    for (let i = 0; i < data.length; i++) {
        point(x, y);
    }

    console.log("complete");
}

async function loadData(fileName) {
    table = await loadTable('sampledata.csv', ',', 'header');
    console.log(table);
}


function keyPressed(event) {
    if (event.key === 'g') {
        console.log("g pressed");
        gradient("data", -350, -250, 400, 400);
    } else if (event.key === 'f') {
        console.log("f pressed");
        loadData(fileName);
    } else if (event.key === 'r') {
        console.log("r pressed");
        points("data", -350, -250, 400, 400);
    }
}