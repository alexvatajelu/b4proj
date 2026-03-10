// Source - https://stackoverflow.com/a/6375580
// Posted by Senad Meškin, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-10, License - CC BY-SA 4.0

let width, height;
let urlInput, fetchButton, outputArea;

function setup() {
    // we don't actually need a drawing surface for this tool;
    // removing or hiding the canvas stops p5 from capturing events
    // and gives the page back to the browser, preventing the
    // "freezing" sensation.
    noCanvas();                // remove the default canvas entirely
    // alternatively, if you want a background canvas you can do:
    // const c = createCanvas(windowWidth, windowHeight);
    // c.position(0,0);
    // c.style('z-index','-1');
    // noLoop();

    width = windowWidth;
    height = windowHeight;

    // build a simple form using p5 DOM helpers
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
    outputArea.size(width - 20, height - 60);
    outputArea.attribute('readonly', true);
}

function windowResized() {
    width = windowWidth;
    height = windowHeight;
    // if you decide to keep a canvas, uncomment the next line:
    // resizeCanvas(width, height);
    if (urlInput) urlInput.size(width - 120, 30);
    if (outputArea) outputArea.size(width - 20, height - 60);
    fetchButton.position(width - 100, 10);

}

// no draw loop needed since we removed the canvas
function draw() {
    // nothing to do
}

// fetch the HTML for the supplied URL and display it in the textarea
function fetchData(url) {
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    // Browsers will block cross‑origin requests unless the target
    // server sets the appropriate CORS headers. When you run on
    // localhost with Live Server you still hit those restrictions,
    // so we use a public proxy here. You can replace this with your
    // own proxy (see notes below).
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    // other alternatives:
    //   'https://cors-anywhere.herokuapp.com/'
    //   'https://cors.deno.dev/'

    fetch(corsProxy + encodeURIComponent(url))
        .then(res => res.text())
        .then(html => {
            outputArea.value(html);
        })
        .catch(err => {
            console.error(err);
            outputArea.value('Error: ' + err.message);
        });
}