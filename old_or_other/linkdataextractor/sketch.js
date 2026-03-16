let width, height;

function setup() {
    width = windowWidth;
    height = windowHeight;
    createCanvas(width, height);

    const folderInput = document.getElementById('folderInput');
    if (folderInput) {
        folderInput.addEventListener('change', handleFolderSelect);
    }
    
    const button1 = document.getElementById('button1');
    if (button1) {
        button1.addEventListener('click', b1action);
    }

    const fetchButton = document.getElementById('fetchButton');
    if (fetchButton) {
        fetchButton.addEventListener('click', () => {
            const url = document.getElementById('urlInput').value;
            fetchUrl(url);
        });
    }

}

function draw() {
  background(220);
}

function windowResized() {
    width = windowWidth;
    height = windowHeight;
    resizeCanvas(width, height);
}

function handleFolderSelect(event) {
    const files = Array.from(event.target.files);
    
    selectedJpegs = files.filter(file => {
        const name = file.name.toLowerCase();
        return name.endsWith('.jpg') || name.endsWith('.jpeg');
    });
    
    if (selectedJpegs.length > 0) {
        const pathParts = selectedJpegs[0].webkitRelativePath.split('/');
        folderName = pathParts.length > 1 ? pathParts[0] : 'selected_folder';
    }
    
    const button1 = document.getElementById('button1');

    if (button1) button1.style.display = selectedJpegs.length > 0 ? 'block' : 'none';
    
    displayImageList();
}

function b1action() {
    
}

function fetchUrl(url) {
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    const corsProxy = 'https://cors.deno.dev/';

    fetch(corsProxy + url)
    .then(res => res.text())
    .then(html => {
        outputBox.value(html);
    })
    .catch(err => {
        outputBox.value('Error: ' + err.message);
        console.error(err);
    });
}