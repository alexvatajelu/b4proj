let width, height;
let selectedJpegs = [];
let currentImage = null;
let currentImageName = '';
let averageColor = null;
let averageHSL = null;
let averageStdDev = null;
let mostCommonColor = null;
let allHSL = [];
let allMostCommon = [];
let allSaturations = [];
let folderName = 'exported_strips';

function setup() {
    width = windowWidth;
    height = windowHeight;
    createCanvas(width, height);
    
    // Set up folder input listener
    const folderInput = document.getElementById('folderInput');
    if (folderInput) {
        folderInput.addEventListener('change', handleFolderSelect);
    }
    
    // Set up average color button
    const avgColorBtn = document.getElementById('avgColorBtn');
    if (avgColorBtn) {
        avgColorBtn.addEventListener('click', calculateAverageColor);
    }
    
    // Set up generate strip button
    const generateStripBtn = document.getElementById('generateStripBtn');
    if (generateStripBtn) {
        generateStripBtn.addEventListener('click', generateColorStrip);
    }
    
    // Set up export strip button
    const exportStripBtn = document.getElementById('exportStripBtn');
    if (exportStripBtn) {
        exportStripBtn.addEventListener('click', exportColorStrips);
    }
    
    // set up ignore white checkbox (no listener needed, read in calc)
    const ignoreWhiteCheckbox = document.getElementById('ignoreWhite');
    if (ignoreWhiteCheckbox) {
        ignoreWhiteCheckbox.checked = false;
    }
}

function draw() {
    background(255, 0, 0);
    
    // Display selected JPEG count
    fill(0);
    textSize(24);
    text(`Selected JPEGs: ${selectedJpegs.length}`, 20, 40);
    
    // Display current image if selected
    if (currentImage) {
        textSize(18);
        text(`Current: ${currentImageName}`, 400, 70);
        
        // Calculate scaled dimensions to fit canvas
        let imgWidth = currentImage.width;
        let imgHeight = currentImage.height;
        let maxWidth = width - 40;
        let maxHeight = height - 120;
        
        let scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
        let displayWidth = imgWidth * scale;
        let displayHeight = imgHeight * scale;
        
        image(currentImage, 400, 100, displayWidth, displayHeight);
        
        let yPos;
        // Display average colors if calculated
        if (averageColor) {
            yPos = 100 + displayHeight + 30;
            fill(averageColor);
            rect(400, yPos, 100, 100);
            
            // Display most common color if available
            if (mostCommonColor) {
                fill(mostCommonColor);
                rect(520, yPos, 100, 100);
            }
            
            fill(0);
            textSize(14);
            text(`RGB: ${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]}`, 710, yPos + 25);
            text(`HEX: #${hexa(averageColor[0])}${hexa(averageColor[1])}${hexa(averageColor[2])}`, 710, yPos + 50);
            if (averageHSL) {
                text(`HSL: ${averageHSL[0]}°, ${averageHSL[1]}%, ${averageHSL[2]}%`, 710, yPos + 75);
            }
            if (averageStdDev !== null) {
                text(`StdDev: ${averageStdDev.toFixed(1)/255}`, 710, yPos + 100);
            }
            if (mostCommonColor) {
                text(`Most Common: ${mostCommonColor[0]}, ${mostCommonColor[1]}, ${mostCommonColor[2]}`, 710, yPos + 125);
                text(`HEX: #${hexa(mostCommonColor[0])}${hexa(mostCommonColor[1])}${hexa(mostCommonColor[2])}`, 710, yPos + 150);
            }
        }
        
        // Display color strip if generated
        if (allHSL.length > 0) {
            let stripY = yPos + 170;
            let stripHeight = 50;
            
            // Average color strip
            fill(0);
            textSize(12);
            text('Average Colors:', 400, stripY - 5);
            for (let i = 0; i < allHSL.length; i++) {
                let hsl = allHSL[i];
                let rgb = hslToRgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
                fill(rgb);
                noStroke();
                rect(400 + i, stripY, 1, stripHeight);
            }
            
            // Most common color strip
            let stripY2 = stripY + stripHeight + 20;
            fill(0);
            text('Most Common Colors:', 400, stripY2 - 5);
            for (let i = 0; i < allMostCommon.length; i++) {
                let rgb = allMostCommon[i];
                fill(rgb);
                noStroke();
                rect(400 + i, stripY2, 1, stripHeight);
            }
            
            // Saturation bars
            let satY = stripY2 + stripHeight + 20;
            fill(0);
            text('Saturation Levels:', 400, satY - 5);
            for (let i = 0; i < allSaturations.length; i++) {
                let sat = allSaturations[i];
                fill(100, 100, 100); // gray bars
                noStroke();
                rect(400 + i, satY + (100 - sat), 1, sat);
            }
        }
    }

    


}

function getavcol() {
    loadPixels();

    // to access a pixel's color, we use get()
    // notice the pixels are little arrays?
    // each contains r, g, b, and a (which is alpha)
    // so if we want to get the rgb values from the
    // pixel at (100,100) we could do this
    let px = get(100, 100);

    let r = px[0];
    let g = px[1];
    let b = px[2];
    console.log(r + ', ' + g + ', ' + b);

    // Style the square with the pixel's color.
    fill(px);
    noStroke();

    // Display the square.
    square(25, 25, 50);
}

function handleFolderSelect(event) {
    const files = Array.from(event.target.files);
    
    // Filter for JPEG files only
    selectedJpegs = files.filter(file => {
        const name = file.name.toLowerCase();
        return name.endsWith('.jpg') || name.endsWith('.jpeg');
    });
    
    // Extract folder name from first file's path
    if (selectedJpegs.length > 0) {
        const pathParts = selectedJpegs[0].webkitRelativePath.split('/');
        folderName = pathParts.length > 1 ? pathParts[0] : 'selected_folder';
    }
    
    console.log(`Found ${selectedJpegs.length} JPEG images`);
    
    // Reset strip when new folder selected
    allHSL = [];
    allMostCommon = [];
    allSaturations = [];
    
    // Show/hide buttons based on selection
    const avgColorBtn = document.getElementById('avgColorBtn');
    const generateStripBtn = document.getElementById('generateStripBtn');
    const exportStripBtn = document.getElementById('exportStripBtn');
    if (avgColorBtn) avgColorBtn.style.display = selectedJpegs.length > 0 ? 'block' : 'none';
    if (generateStripBtn) generateStripBtn.style.display = selectedJpegs.length > 0 ? 'block' : 'none';
    if (exportStripBtn) exportStripBtn.style.display = allHSL.length > 0 ? 'block' : 'none';
    
    // Display list in UI
    displayImageList();
}

function displayImageList() {
    const listContainer = document.getElementById('imageList');
    listContainer.innerHTML = '';
    
    const heading = document.createElement('h3');
    heading.textContent = `Found ${selectedJpegs.length} JPEG image(s)`;
    listContainer.appendChild(heading);
    
    const list = document.createElement('ul');
    selectedJpegs.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        li.style.cursor = 'pointer';
        li.style.padding = '8px';
        li.style.borderRadius = '4px';
        li.style.transition = 'background-color 0.2s';
        
        li.addEventListener('mouseenter', () => {
            li.style.backgroundColor = '#e0e0e0';
        });
        
        li.addEventListener('mouseleave', () => {
            li.style.backgroundColor = 'transparent';
        });
        
        li.addEventListener('click', () => {
            displaySelectedImage(file, file.name);
        });
        
        list.appendChild(li);
    });
    listContainer.appendChild(list);
}

function displaySelectedImage(file, fileName) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Convert HTML Image to p5.Image
            let p5img = createImage(img.width, img.height);
            p5img.drawingContext.drawImage(img, 0, 0);
            
            currentImage = p5img;
            currentImageName = fileName;
            averageColor = null; // Reset average color when new image is loaded
            averageHSL = null;
            averageStdDev = null;
            mostCommonColor = null;
            
            // Show the average color button
            const avgColorBtn = document.getElementById('avgColorBtn');
            if (avgColorBtn) {
                avgColorBtn.style.display = 'block';
            }
            
            // automatically calculate average for new image
            calculateAverageColor();
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function calculateAverageColor() {
    if (!currentImage) return;
    const ignoreWhite = document.getElementById('ignoreWhite')?.checked;
    
    let sumR = 0, sumG = 0, sumB = 0;
    let pixelCount = 0;
    
    currentImage.loadPixels();
    
    // Sample every pixel
    for (let i = 0; i < currentImage.pixels.length; i += 4) {
        const r = currentImage.pixels[i];
        const g = currentImage.pixels[i + 1];
        const b = currentImage.pixels[i + 2];
        // ignore near-white if requested
        if (ignoreWhite) {
            if (r > 240 && g > 240 && b > 240) {
                continue;
            }
        }
        sumR += r;
        sumG += g;
        sumB += b;
        pixelCount++;
    }
    
    if (pixelCount === 0) {
        averageColor = [0,0,0];
        averageHSL = [0,0,0];
        return;
    }
    
    // Calculate average
    let avgR = Math.round(sumR / pixelCount);
    let avgG = Math.round(sumG / pixelCount);
    let avgB = Math.round(sumB / pixelCount);
    
    averageColor = [avgR, avgG, avgB];
    averageHSL = rgbToHsl(avgR, avgG, avgB);
    
    // compute most common color
    mostCommonColor = findMostCommonColor(currentImage, ignoreWhite);
    
    // compute standard deviation of color distances
    let sumSqDist = 0;
    currentImage.loadPixels();
    for (let i = 0; i < currentImage.pixels.length; i += 4) {
        const r = currentImage.pixels[i];
        const g = currentImage.pixels[i + 1];
        const b = currentImage.pixels[i + 2];
        if (ignoreWhite) {
            if (r > 240 && g > 240 && b > 240) continue;
        }
        const dist = Math.sqrt((r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2);
        sumSqDist += dist * dist;
    }
    averageStdDev = Math.sqrt(sumSqDist / pixelCount);
    console.log(`StdDev: ${averageStdDev.toFixed(2)}`);

    console.log(`Average color: RGB(${avgR}, ${avgG}, ${avgB})  HSL(${averageHSL[0]}, ${averageHSL[1]}, ${averageHSL[2]})`);
}

function findMostCommonColor(img, ignoreWhite) {
    img.loadPixels();
    let colorCounts = {};
    let maxCount = 0;
    let mostCommon = [0, 0, 0];
    
    for (let i = 0; i < img.pixels.length; i += 4) {
        const r = img.pixels[i];
        const g = img.pixels[i + 1];
        const b = img.pixels[i + 2];
        
        if (ignoreWhite && r > 240 && g > 240 && b > 240) continue;
        
        // Quantize to 16 levels per channel (4 bits)
        const qr = Math.floor(r / 16);
        const qg = Math.floor(g / 16);
        const qb = Math.floor(b / 16);
        const key = `${qr}-${qg}-${qb}`;
        
        colorCounts[key] = (colorCounts[key] || 0) + 1;
        
        if (colorCounts[key] > maxCount) {
            maxCount = colorCounts[key];
            // Use the center of the bin as representative color
            mostCommon = [Math.round((qr + 0.5) * 16), Math.round((qg + 0.5) * 16), Math.round((qb + 0.5) * 16)];
        }
    }
    
    return mostCommon;
}

function generateColorStrip() {
    allHSL = [];
    allMostCommon = [];
    let promises = selectedJpegs.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    let p5img = createImage(img.width, img.height);
                    p5img.drawingContext.drawImage(img, 0, 0);
                    let hsl = calculateImageHSL(p5img);
                    let mostCommon = findMostCommonColor(p5img, document.getElementById('ignoreWhite')?.checked);
                    let satHSL = rgbToHsl(mostCommon[0], mostCommon[1], mostCommon[2]);
                    allHSL.push(hsl);
                    allMostCommon.push(mostCommon);
                    allSaturations.push(satHSL[1]); // saturation is index 1
                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
    Promise.all(promises).then(() => {
        console.log('Color strip generated with', allHSL.length, 'colors');
        
        // Show export button
        const exportStripBtn = document.getElementById('exportStripBtn');
        if (exportStripBtn) exportStripBtn.style.display = 'block';
    });
}

function exportColorStrips() {
    if (allHSL.length === 0 || allMostCommon.length === 0) return;
    
    // Create graphics for average strip
    let avgStrip = createGraphics(allHSL.length, 50);
    avgStrip.background(255);
    for (let i = 0; i < allHSL.length; i++) {
        let hsl = allHSL[i];
        let rgb = hslToRgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
        avgStrip.fill(rgb);
        avgStrip.noStroke();
        avgStrip.rect(i, 0, 1, 50);
    }
    save(avgStrip, `${folderName}_average.png`);
    
    // Create graphics for most common strip
    let mostStrip = createGraphics(allMostCommon.length, 50);
    mostStrip.background(255);
    for (let i = 0; i < allMostCommon.length; i++) {
        let rgb = allMostCommon[i];
        mostStrip.fill(rgb);
        mostStrip.noStroke();
        mostStrip.rect(i, 0, 1, 50);
    }
    save(mostStrip, `${folderName}_most.png`);
    
    console.log('Strips exported as', `${folderName}_average.png`, 'and', `${folderName}_most.png`);
}

function calculateImageHSL(p5img) {
    const ignoreWhite = document.getElementById('ignoreWhite')?.checked;
    p5img.loadPixels();
    let sumR = 0, sumG = 0, sumB = 0;
    let pixelCount = 0;
    for (let i = 0; i < p5img.pixels.length; i += 4) {
        const r = p5img.pixels[i];
        const g = p5img.pixels[i + 1];
        const b = p5img.pixels[i + 2];
        if (ignoreWhite && r > 240 && g > 240 && b > 240) continue;
        sumR += r;
        sumG += g;
        sumB += b;
        pixelCount++;
    }
    if (pixelCount === 0) return [0, 0, 0];
    let avgR = sumR / pixelCount;
    let avgG = sumG / pixelCount;
    let avgB = sumB / pixelCount;
    return rgbToHsl(avgR, avgG, avgB);
}

function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexa(value) {
    let h = value.toString(16);
    return h.length === 1 ? '0' + h : h;
}

// convert rgb [0-255] to hsl [h:0-360, s:0-100, l:0-100]
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = max3(r, g, b);
    const min = min3(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }
        h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function max3(a,b,c){return a>b?(a>c?a:c):(b>c?b:c);}
function min3(a,b,c){return a<b?(a<c?a:c):(b<c?b:c);}

function windowResized() {
    width = windowWidth;
    height = windowHeight;
    resizeCanvas(width, height);
}

