
let width, height;
let urlInput, fetchButton, outputArea;
let table;


function setup() {
    noCanvas();

    width = windowWidth;
    height = windowHeight;
    // createCanvas(width, height);

    urlInput = createInput('');
    urlInput.attribute('placeholder', 'Enter URL here');
    urlInput.position(10, 10);
    urlInput.size(width - 120, 30);

    fetchButton = createButton('Fetch');
    fetchButton.position(width - 95, 10);
    fetchButton.size(90, 35);
    fetchButton.mousePressed(() => {
        const url = urlInput.value();
        fetchData(url);
    });

    outputArea = createElement('textarea', '');
    outputArea.position(10, 50);
    outputArea.size(width - 20, 200);
    outputArea.attribute('readonly', true);

    fileLoader = createElement('input');
    fileLoader.attribute('type', 'file');
    fileLoader.attribute('accept', '.csv');
    fileLoader.position(10, 310);
    fileLoader.changed(handleFile);

    dataTable = createElement('table');
    dataTable.position(10, 340);
    dataTable.size(width - 15, height - 500);
    dataTable.attribute('border', '1');
    //dataTable. 

    // load csv for headers and data
    // allow editing of csv from data1.csv
}

function windowResized() {
    width = windowWidth;
    height = windowHeight;

    // resizeCanvas(width, height);

    if (urlInput) urlInput.size(width - 120, 30);
    if (outputArea) outputArea.size(width - 20, 200);
    if (fetchButton) fetchButton.position(width - 95, 10);
    if (dataTable) dataTable.size(width - 15, height - 500);
    if (dataTable) dataTable.position(10, 340);


}

function handleFile(file) {

    /*
  if (file.type !== 'text') {
    alert("Please upload a CSV file");
    return;
  }
    */

  // clear previous table
  dataTable.html('');
    console.log(file);


  let rows = file.data.trim().split('\n');

  for (let r = 0; r < rows.length; r++) {

    let tr = createElement('tr');
    tr.parent(dataTable);

    let cols = rows[r].split(',');

    for (let c = 0; c < cols.length; c++) {

      let cellText = cols[c].replace('\r', '');

      // first row = header
      if (r === 0) {
        createElement('th', cellText).parent(tr);
      } else {
        createElement('td', cellText).parent(tr);
      }

    }
  }

  console.log(file);
}

function draw() {

}


function fetchData(url) {
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    const corsProxy = 'https://api.allorigins.win/raw?url=';

    outputArea.value('to be implemented later - url: ' + url);
}