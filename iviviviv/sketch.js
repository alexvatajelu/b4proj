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
    if (!table){
        console.log("no data, drawing points failled");
        return;
    }
    console.log("drawing points");

    noStroke();
    fill(255);
    rect(x, y, w, h);

    console.log(`data :\n${data}`);
    console.log(`rows: ${data.rows.length}`);

    //console.log(data.rows[0].arr[0]);

    let pointSize = 8;
    for (let i = 0; i < data.rows.length; i++) {        
        let px = data.rows[i].arr[0];
        let py = data.rows[i].arr[1];
        let hex = data.rows[i].arr[2];

        px = px * w + x;
        py = py * h + y;

        console.log(`px: ${px}, py: ${py}, colour: ${hex}`);

        fill(hex);
        ellipse(px - (pointSize/2), py - (pointSize/2), pointSize, pointSize);
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
        gradient(table, -350, -250, 400, 400);
    } else if (event.key === 'f') {
        console.log("f pressed");
        loadData(fileName);
    } else if (event.key === 'r') {
        console.log("r pressed");
        points(table, -350, -250, 400, 400);
    }
}