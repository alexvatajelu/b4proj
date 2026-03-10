
let width, height;
let urlInput, fetchButton, outputArea;

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
    fetchButton.position(width - 100, 10);
    fetchButton.size(80, 30);
    fetchButton.mousePressed(() => {
        const url = urlInput.value();
        fetchData(url);
    });

    outputArea = createElement('textarea', '');
    outputArea.position(10, 50);
    outputArea.size(width - 20, height - 60 - 500);
    outputArea.attribute('readonly', true);

    dataTable = createElement('table');
    dataTable.position(10, height - 500);
    dataTable.size(width - 15, height - 60 - 500);
    dataTable.attribute('border', '1');

    // load csv for headers and data
    // allow editing of csv
}

function windowResized() {
    width = windowWidth;
    height = windowHeight;

    // resizeCanvas(width, height);

    if (urlInput) urlInput.size(width - 120, 30);
    if (outputArea) outputArea.size(width - 20, height - 60 - 500);
    if (fetchButton) fetchButton.position(width - 100, 10);
    if (dataTable) dataTable.size(width - 15, height - 60 - 500);

}


function draw() {
}


function fetchData(url) {
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    const corsProxy = 'https://api.allorigins.win/raw?url=';

    outputArea.value('to be implemented - url: ' + url);
}