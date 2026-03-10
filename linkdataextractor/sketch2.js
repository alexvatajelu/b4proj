// Source - https://stackoverflow.com/a/6375580
// Posted by Senad Meškin, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-10, License - CC BY-SA 4.0

let width, height;
let urlInput, fetchButton, outputArea;

function setup() {
    width = windowWidth;
    height = windowHeight;
    createCanvas(width, height);

    // create HTML elements for URL fetching
    urlInput = createInput('');
    urlInput.attribute('placeholder', 'Enter URL here');
    urlInput.position(10, 10);
    urlInput.size(width - 120, 30);

    fetchButton = createButton('Fetch');
    fetchButton.position(width - 100, 10);
    fetchButton.size(80, 30);
    fetchButton.mousePressed(getData);

    outputArea = createElement('textarea', '');
    outputArea.position(10, 50);
    outputArea.size(width - 20, height - 60);
    outputArea.attribute('readonly', true);
}

function windowResized() {
    width = windowWidth;
    height = windowHeight;
    resizeCanvas(width, height);
}

function draw() {
    background(220);
}

function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

// removed automatic request – it's now triggered by button

function doFetch() {

    // not in use


    const url = urlInput.value().trim();
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    const request = makeHttpObject();
    request.open("GET", url, true);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status >= 200 && request.status < 300) {
                outputArea.elt.value = request.responseText;
            } else {
                outputArea.elt.value = 'Error: ' + request.status + ' ' + request.statusText;
            }
        }
    };
    request.send(null);
}

async function getData() {
  const url = urlInput.value().trim();
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.text();
    outputArea.elt.value = result;
    console.log(result);
  } catch (error) {
    console.error(error.message);
    outputArea.elt.value = `Error fetching data: ${error.message}`;
  }
}