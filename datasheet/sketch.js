let width, height;
let folderLoader;
let folderPickerBtn;
let statusEl;
let tableContainer;
let imgEl;
let tableRowEls = [];
let prevBtn, nextBtn;
let rowInfoEl;
let writeCurrentBtn, writeAllBtn;
let ignoreWhiteCheckbox;
let avgSwatchEl, commonSwatchEl;
let avgTextEl, commonTextEl;

let currentImageFilename = '';
let colourScratchCanvas;

let csvState = {
  header: [],
  rows: [], // array of arrays (string[])
  selectedRow: 0,
  imageColIdx: -1,
  colIdx: {
    avgHex: -1,
    avgRgb: -1,
    avgHsl: -1,
    commonHex: -1,
    commonRgb: -1,
    commonHsl: -1,
    pricePerUnit: -1,
    categoryPriceAverage: -1,
    priceFactorToAverage: -1,
  },
};

// For image preview
let jpgFileByName = new Map(); // name -> File (input mode)
let jpgHandleByName = new Map(); // name -> FileSystemFileHandle (FS access mode)
let currentImageObjectUrl = null;
let currentDirHandle = null; // FileSystemDirectoryHandle when using FS Access
let currentCsvFilename = '';

function windowResized() {
  width = windowWidth;
  height = windowHeight;
  resizeCanvas(width, height);
}

function setup() {
  width = windowWidth;
  height = windowHeight;
  noCanvas();
  elementSetup();
  renderTable();
  clearImagePreview();
  if (rowInfoEl) rowInfoEl.html('');
}

function draw() {
  
}

function elementSetup() {
  if (!statusEl) {
    statusEl = createP('');
    statusEl.position(10, 10);
    statusEl.style('margin', '0');
    statusEl.style('font-family', 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif');
  }

  if (!folderLoader && 0) {
    folderLoader = createElement('input');
    folderLoader.attribute('type', 'file');
    // Folder picking via <input> (read-only access to folder contents)
    folderLoader.attribute('webkitdirectory', '');
    folderLoader.attribute('directory', '');
    folderLoader.attribute('multiple', '');
    folderLoader.changed(handleFolder);
    folderLoader.position(10, 50);  
  }

  if (!folderPickerBtn) {
    folderPickerBtn = createButton('Pick folder (can auto-create sample.csv)');
    folderPickerBtn.position(10, 80);
    folderPickerBtn.mousePressed(handleFolderViaFSAccess);
    folderPickerBtn.attribute('title', 'Uses the File System Access API when available (Chrome/Edge).');
  }

  if (!prevBtn) {
    prevBtn = createButton('Prev');
    prevBtn.position(10, 120);
    prevBtn.mousePressed(() => selectRow(csvState.selectedRow - 1));
  }
  if (!nextBtn) {
    nextBtn = createButton('Next');
    nextBtn.position(70, 120);
    nextBtn.mousePressed(() => selectRow(csvState.selectedRow + 1));
  }
  if (!rowInfoEl) {
    rowInfoEl = createSpan('');
    rowInfoEl.position(140, 125);
    rowInfoEl.style('font-family', 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif');
  }

  if (!imgEl) {
    imgEl = createImg('', 'selected image');
    imgEl.position(10, 150);
    imgEl.style('max-width', '420px');
    imgEl.style('max-height', '320px');
    imgEl.style('object-fit', 'contain');
    imgEl.style('border', '1px solid #ddd');
    imgEl.style('background', '#fafafa');
  }

  if (!writeCurrentBtn) {
    writeCurrentBtn = createButton('Write colours (current row)');
    writeCurrentBtn.position(10, 450);
    writeCurrentBtn.mousePressed(() => writeColoursForCurrentRow());
  }
  if (!writeAllBtn) {
    writeAllBtn = createButton('Write colours (all rows)');
    writeAllBtn.position(200, 450);
    writeAllBtn.mousePressed(() => writeColoursForAllRows());
  }

  if (!ignoreWhiteCheckbox) {
    ignoreWhiteCheckbox = createCheckbox('Ignore white-ish pixels', true);
    ignoreWhiteCheckbox.position(10, 480);
    ignoreWhiteCheckbox.changed(() => updateColourInfo());
    ignoreWhiteCheckbox.style('font-family', 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif');
  }

  if (!avgSwatchEl) {
    avgSwatchEl = createDiv('');
    avgSwatchEl.position(10, 510);
    avgSwatchEl.style('width', '60px');
    avgSwatchEl.style('height', '24px');
    avgSwatchEl.style('border', '1px solid #ddd');
    avgSwatchEl.style('background', '#ffffff');
  }
  if (!commonSwatchEl) {
    commonSwatchEl = createDiv('');
    commonSwatchEl.position(80, 510);
    commonSwatchEl.style('width', '60px');
    commonSwatchEl.style('height', '24px');
    commonSwatchEl.style('border', '1px solid #ddd');
    commonSwatchEl.style('background', '#ffffff');
  }

  if (!avgTextEl) {
    avgTextEl = createDiv('');
    avgTextEl.position(10, 540);
    avgTextEl.style('max-width', '420px');
    avgTextEl.style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    avgTextEl.style('font-size', '12px');
    avgTextEl.style('white-space', 'pre-wrap');
  }
  if (!commonTextEl) {
    commonTextEl = createDiv('');
    commonTextEl.position(10, 620);
    commonTextEl.style('max-width', '420px');
    commonTextEl.style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    commonTextEl.style('font-size', '12px');
    commonTextEl.style('white-space', 'pre-wrap');
  }

  if (!tableContainer) {
    tableContainer = createDiv('');
    tableContainer.position(450, 50);
    tableContainer.style('max-height', '80vh');
    tableContainer.style('overflow', 'auto');
    tableContainer.style('border', '1px solid #ddd');
    tableContainer.style('padding', '6px');
    tableContainer.style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    tableContainer.style('font-size', '12px');
  }

  // image window

  // table from csv
}

function setStatus(msg) {
  if (statusEl) statusEl.html(msg);
}

async function getBlankCsvText() {
  // `sample.csv` sits next to `index.html` and `sketch.js`
  const res = await fetch('sample.csv', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load sample.csv (${res.status})`);
  return await res.text();
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function splitCsvLineSimple(line) {
  // Minimal CSV splitter (no quoted fields support). OK for our CSV schema.
  return String(line ?? '').replace(/\r$/, '').split(',');
}

function parseCsvSimple(csvText) {
  const text = String(csvText ?? '').replace(/\r\n/g, '\n');
  const rawLines = text.split('\n').filter((l, idx) => idx === 0 || l.trim() !== '');
  const header = splitCsvLineSimple(rawLines[0] ?? '');
  const rows = rawLines.slice(1).map(splitCsvLineSimple);
  return { header, rows };
}

function recomputeColumnIndices() {
  const h = csvState.header;
  csvState.imageColIdx = h.indexOf('image_file');
  const findFirstExisting = (...names) => {
    for (const name of names) {
      const idx = h.indexOf(name);
      if (idx >= 0) return idx;
    }
    return -1;
  };
  csvState.colIdx = {
    avgHex: h.indexOf('average_colour_hex'),
    avgRgb: h.indexOf('average_colour_rgb'),
    avgHsl: h.indexOf('average_colour_hsl'),
    commonHex: h.indexOf('most_common_colour_hex'),
    commonRgb: h.indexOf('most_common_colour_rgb'),
    commonHsl: h.indexOf('most_common_colour_hsl'),
    // Support both old blank.csv schema (`price_per_unit`) and new sample.csv schema (`item_price`)
    pricePerUnit: findFirstExisting('price_per_unit', 'item_price'),
    categoryPriceAverage: findFirstExisting('category_price_average'),
    priceFactorToAverage: findFirstExisting('price_factor_to_average'),
  };
}

function recomputePriceFactors() {
  const idx = csvState.colIdx;
  if (idx.pricePerUnit < 0 || idx.categoryPriceAverage < 0 || idx.priceFactorToAverage < 0) {
    return;
  }

  for (let i = 0; i < csvState.rows.length; i++) {
    const row = csvState.rows[i];
    if (!row) continue;
    ensureRowHasLength(row);

    const priceRaw = (row[idx.pricePerUnit] ?? '').toString().trim();
    const avgRaw = (row[idx.categoryPriceAverage] ?? '').toString().trim();
    const price = parseFloat(priceRaw.replace(',', '.'));
    const avg = parseFloat(avgRaw.replace(',', '.'));

    if (Number.isFinite(price) && Number.isFinite(avg) && avg !== 0) {
      const factor = price / avg;
      row[idx.priceFactorToAverage] = factor.toFixed(3);
    }
  }
}

function csvTextFromState() {
  if (!csvState.header.length) return '';
  // Keep derived columns like price_factor_to_average up to date
  recomputePriceFactors();
  const headerLine = csvState.header.join(',');
  const lines = [headerLine];
  for (const row of csvState.rows) {
    const cells = [];
    for (let i = 0; i < csvState.header.length; i++) {
      cells.push(row[i] ?? '');
    }
    lines.push(cells.join(','));
  }
  return lines.join('\n') + '\n';
}

async function persistCsvStateIfPossible() {
  if (!currentDirHandle || !currentCsvFilename) return;
  try {
    const outHandle = await currentDirHandle.getFileHandle(currentCsvFilename, { create: true });
    const writable = await outHandle.createWritable();
    await writable.write(csvTextFromState());
    await writable.close();
    setStatus(`Saved CSV to ${currentCsvFilename}.`);
  } catch (err) {
    setStatus(`Failed to save CSV: ${err?.message ?? err}`);
  }
}

function ensureJpgRowsInCsv(csvText, jpgNames) {
  const text = String(csvText ?? '').replace(/\r\n/g, '\n');
  const lines = text.split('\n').filter((l, idx) => idx === 0 || l.trim() !== '');

  const headerLine = lines[0] ?? '';
  const header = splitCsvLineSimple(headerLine);
  const imageColIdx = header.indexOf('image_file');

  if (imageColIdx === -1) {
    throw new Error('CSV is missing required "image_file" column.');
  }

  const existingRows = lines.slice(1);
  const existingImageFiles = new Set(
    existingRows
      .map(r => splitCsvLineSimple(r)[imageColIdx] ?? '')
      .map(v => String(v).trim())
      .filter(Boolean)
  );

  const newRows = [];
  for (const name of jpgNames) {
    if (existingImageFiles.has(name)) continue;
    const row = new Array(header.length).fill('');
    row[imageColIdx] = name;
    newRows.push(row.join(','));
  }

  const outLines = [headerLine, ...existingRows, ...newRows];
  return outLines.join('\n') + '\n';
}

function clearImagePreview() {
  if (currentImageObjectUrl) {
    URL.revokeObjectURL(currentImageObjectUrl);
    currentImageObjectUrl = null;
  }
  if (imgEl) imgEl.attribute('src', '');
  currentImageFilename = '';
  clearColourInfo();
}

function clearColourInfo() {
  if (avgSwatchEl) avgSwatchEl.style('background', '#ffffff');
  if (commonSwatchEl) commonSwatchEl.style('background', '#ffffff');
  if (avgTextEl) avgTextEl.html('');
  if (commonTextEl) commonTextEl.html('');
}

function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex([r, g, b]) {
  const toHex = (v) => clampByte(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl([r0, g0, b0]) {
  // Returns [h, s, l] where h is 0..360, s/l 0..100
  const r = clampByte(r0) / 255;
  const g = clampByte(g0) / 255;
  const b = clampByte(b0) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function isWhiteish(r, g, b, threshold = 245) {
  return r >= threshold && g >= threshold && b >= threshold;
}

function getImagePixelDataFromImgElement(imgElement) {
  if (!imgElement?.naturalWidth || !imgElement?.naturalHeight) return null;
  if (!colourScratchCanvas) {
    colourScratchCanvas = document.createElement('canvas');
  }
  // Downsample for speed but keep enough detail for colour stats
  const maxDim = 220;
  const scale = Math.min(1, maxDim / Math.max(imgElement.naturalWidth, imgElement.naturalHeight));
  const w = Math.max(1, Math.round(imgElement.naturalWidth * scale));
  const h = Math.max(1, Math.round(imgElement.naturalHeight * scale));
  colourScratchCanvas.width = w;
  colourScratchCanvas.height = h;
  const ctx = colourScratchCanvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(imgElement, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

function computeColoursFromPixels(pixels, { ignoreWhite = true } = {}) {
  // pixels: Uint8ClampedArray [r,g,b,a,...]
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const hist = new Map(); // quantized rgb -> count

  const step = 4;
  for (let i = 0; i < pixels.length; i += step) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 16) continue;
    if (ignoreWhite && isWhiteish(r, g, b)) continue;

    rSum += r; gSum += g; bSum += b; count++;

    // Quantize to reduce noise (5 bits per channel)
    const rq = r >> 3;
    const gq = g >> 3;
    const bq = b >> 3;
    const key = (rq << 10) | (gq << 5) | bq;
    hist.set(key, (hist.get(key) || 0) + 1);
  }

  if (!count) return null;

  const avg = [rSum / count, gSum / count, bSum / count].map(clampByte);

  let bestKey = null;
  let bestCount = -1;
  for (const [k, v] of hist.entries()) {
    if (v > bestCount) { bestCount = v; bestKey = k; }
  }
  const rq = (bestKey >> 10) & 31;
  const gq = (bestKey >> 5) & 31;
  const bq = bestKey & 31;
  // De-quantize back to 0..255 (center of bucket)
  const common = [rq, gq, bq].map(v => clampByte(v * 8 + 4));

  return { avgRgb: avg, commonRgb: common };
}

function formatColourBlock(title, rgb) {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  return `${title}\nhex: ${hex}\nrgb: [${rgb[0]}, ${rgb[1]}, ${rgb[2]}]\nhsl: [${hsl[0]}, ${hsl[1]}, ${hsl[2]}]`;
}

let lastColourResult = null;

function updateColourInfo() {
  if (!imgEl?.elt?.src) {
    clearColourInfo();
    lastColourResult = null;
    return;
  }

  const imgElement = imgEl.elt;
  if (!imgElement.complete || !imgElement.naturalWidth) {
    // Will be re-run on load event
    return;
  }

  const pixels = getImagePixelDataFromImgElement(imgElement);
  if (!pixels) {
    clearColourInfo();
    lastColourResult = null;
    return;
  }

  const ignoreWhite = !!ignoreWhiteCheckbox?.checked();
  const result = computeColoursFromPixels(pixels, { ignoreWhite });
  if (!result) {
    clearColourInfo();
    lastColourResult = null;
    setStatus('No pixels left after filtering (try unchecking "ignore white-ish pixels").');
    return null;
  }

  const { avgRgb, commonRgb } = result;

  if (avgSwatchEl) avgSwatchEl.style('background', rgbToHex(avgRgb));
  if (commonSwatchEl) commonSwatchEl.style('background', rgbToHex(commonRgb));
  if (avgTextEl) avgTextEl.html(formatColourBlock('Average colour', avgRgb));
  if (commonTextEl) commonTextEl.html(formatColourBlock('Most common colour', commonRgb));
  lastColourResult = result;
  return result;
}

async function setImagePreviewByName(filename) {
  clearImagePreview();
  if (!filename) {
    // Don't treat this as an error; many columns may be blank.
    return;
  }
  currentImageFilename = filename;

  // Input mode: File object available
  if (jpgFileByName.has(filename)) {
    const file = jpgFileByName.get(filename);
    currentImageObjectUrl = URL.createObjectURL(file);
    imgEl.attribute('src', currentImageObjectUrl);
    imgEl.elt.onload = () => updateColourInfo();
    // If the image is cached and loads instantly, still try once.
    setTimeout(updateColourInfo, 0);
    return;
  }

  // FS Access mode: handle available
  if (jpgHandleByName.has(filename)) {
    const handle = jpgHandleByName.get(filename);
    const file = await handle.getFile();
    currentImageObjectUrl = URL.createObjectURL(file);
    imgEl.attribute('src', currentImageObjectUrl);
    imgEl.elt.onload = () => updateColourInfo();
    setTimeout(updateColourInfo, 0);
    return;
  }

  setStatus(`Couldn't find image file "${filename}" in the selected folder (top-level only).`);
}

function ensureRowHasLength(row) {
  while (row.length < csvState.header.length) {
    row.push('');
  }
}

function applyColourResultToRow(rowIdx, colourResult) {
  if (!colourResult) return;
  const { avgRgb, commonRgb } = colourResult;
  const idx = csvState.colIdx;
  if (!csvState.header.length) return;

  const row = csvState.rows[rowIdx] || (csvState.rows[rowIdx] = []);
  ensureRowHasLength(row);

  const avgHex = rgbToHex(avgRgb);
  const avgHsl = rgbToHsl(avgRgb);
  const commonHex = rgbToHex(commonRgb);
  const commonHsl = rgbToHsl(commonRgb);

  if (idx.avgHex >= 0) row[idx.avgHex] = avgHex;
  // Space-separated numeric triples so CSV commas don't split them
  if (idx.avgRgb >= 0) row[idx.avgRgb] = `${avgRgb[0]} ${avgRgb[1]} ${avgRgb[2]}`;
  if (idx.avgHsl >= 0) row[idx.avgHsl] = `${avgHsl[0]} ${avgHsl[1]} ${avgHsl[2]}`;
  if (idx.commonHex >= 0) row[idx.commonHex] = commonHex;
  if (idx.commonRgb >= 0) row[idx.commonRgb] = `${commonRgb[0]} ${commonRgb[1]} ${commonRgb[2]}`;
  if (idx.commonHsl >= 0) row[idx.commonHsl] = `${commonHsl[0]} ${commonHsl[1]} ${commonHsl[2]}`;
}

async function writeColoursForCurrentRow() {
  if (!csvState.rows.length) {
    setStatus('No CSV loaded.');
    return;
  }
  const idx = csvState.selectedRow;
  const imageName = csvState.imageColIdx >= 0
    ? (csvState.rows[idx][csvState.imageColIdx] ?? '').trim()
    : '';
  if (!imageName) {
    setStatus('Current row has no image_file value.');
    return;
  }

  const result = updateColourInfo();
  if (!result) return;

  applyColourResultToRow(idx, result);
  recomputePriceFactors();
  renderTable();
  await persistCsvStateIfPossible();
}

function getFileOrHandleForImageName(name) {
  if (jpgFileByName.has(name)) {
    return jpgFileByName.get(name);
  }
  if (jpgHandleByName.has(name)) {
    return jpgHandleByName.get(name);
  }
  return null;
}

function computeColoursForImageName(name, ignoreWhite) {
  return new Promise((resolve) => {
    const src = getFileOrHandleForImageName(name);
    if (!src) {
      resolve(null);
      return;
    }

    const makeObjectUrl = async () => {
      if (src instanceof File || (typeof File !== 'undefined' && src instanceof File)) {
        return URL.createObjectURL(src);
      }
      // FileSystemFileHandle
      const file = await src.getFile();
      return URL.createObjectURL(file);
    };

    (async () => {
      const url = await makeObjectUrl();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const pixels = getImagePixelDataFromImgElement(img);
        URL.revokeObjectURL(url);
        if (!pixels) {
          resolve(null);
          return;
        }
        const result = computeColoursFromPixels(pixels, { ignoreWhite });
        resolve(result);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    })().catch(() => resolve(null));
  });
}

async function writeColoursForAllRows() {
  if (!csvState.rows.length) {
    setStatus('No CSV loaded.');
    return;
  }

  const ignoreWhite = !!ignoreWhiteCheckbox?.checked();
  setStatus('Computing colours for all rows…');

  for (let i = 0; i < csvState.rows.length; i++) {
    const row = csvState.rows[i];
    const imageName = csvState.imageColIdx >= 0
      ? (row[csvState.imageColIdx] ?? '').trim()
      : '';
    if (!imageName) continue;

    const result = await computeColoursForImageName(imageName, ignoreWhite);
    if (!result) continue;
    applyColourResultToRow(i, result);
  }

  recomputePriceFactors();
  renderTable();
  await persistCsvStateIfPossible();
  setStatus('Finished computing colours for all rows.');
}

function renderTable() {
  if (!tableContainer) return;
  tableContainer.html('');

  tableRowEls = [];

  if (!csvState.header.length) {
    tableContainer.html('<div>No CSV loaded yet.</div>');
    return;
  }

  const table = createElement('table');
  table.parent(tableContainer);
  table.style('border-collapse', 'collapse');
  table.style('width', '100%');

  const thead = createElement('thead');
  thead.parent(table);

  const trh = createElement('tr');
  trh.parent(thead);

  for (const h of csvState.header) {
    const th = createElement('th', h);
    th.parent(trh);
    th.style('border', '1px solid #ddd');
    th.style('padding', '4px 6px');
    th.style('position', 'sticky');
    th.style('top', '0');
    th.style('background', '#f3f3f3');
    th.style('text-align', 'left');
  }

  const tbody = createElement('tbody');
  tbody.parent(table);

  csvState.rows.forEach((row, idx) => {
    const tr = createElement('tr');
    tr.parent(tbody);

    tableRowEls.push(tr);

    tr.style('cursor', 'pointer');

    tr.mouseClicked(() => selectRow(idx));

    if (idx === csvState.selectedRow) {
      tr.style('background', '#e8f0ff');
    }

    for (let c = 0; c < csvState.header.length; c++) {
      const td = createElement('td', row[c] ?? '');
      td.parent(tr);

      td.style('border', '1px solid #ddd');
      td.style('padding', '3px 6px');
      td.style('white-space', 'nowrap');
      td.style('max-width', '240px');
      td.style('overflow', 'hidden');
      td.style('text-overflow', 'ellipsis');

      td.attribute('contenteditable', 'true');

      // prevent row click when editing
      td.elt.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });

      td.elt.addEventListener('input', (e) => {
        const text = e.target.textContent;
        ensureRowHasLength(csvState.rows[idx]);
        csvState.rows[idx][c] = text;
      });

      td.elt.addEventListener('blur', () => {
        recomputePriceFactors();

        if (currentDirHandle && currentCsvFilename) {
          persistCsvStateIfPossible();
        }
      });
    }
  });
}

async function selectRow(idx) {
  if (!csvState.rows.length) return;

  csvState.selectedRow = Math.max(0, Math.min(idx, csvState.rows.length - 1));

  if (rowInfoEl) {
    rowInfoEl.html(`Row ${csvState.selectedRow + 1} / ${csvState.rows.length}`);
  }

  if (prevBtn) prevBtn.elt.disabled = csvState.selectedRow <= 0;
  if (nextBtn) nextBtn.elt.disabled = csvState.selectedRow >= csvState.rows.length - 1;

  tableRowEls.forEach((rowEl, i) => {
    if (i === csvState.selectedRow) {
      rowEl.style('background', '#e8f0ff');
    } else {
      rowEl.style('background', '');
    }
  });

  const imageName = csvState.imageColIdx >= 0
    ? (csvState.rows[csvState.selectedRow][csvState.imageColIdx] ?? '').trim()
    : '';

  await setImagePreviewByName(imageName);
}

async function loadCsvIntoViewer(csvText) {
  const { header, rows } = parseCsvSimple(csvText);
  csvState.header = header;
  csvState.rows = rows;
  recomputeColumnIndices();
  recomputePriceFactors();
  csvState.selectedRow = 0;
  renderTable();
  await selectRow(0);
}

function handleFolder(event) {
  const input = event?.target;
  const files = input?.files ? Array.from(input.files) : [];

  if (!files.length) {
    setStatus('No folder selected.');
    return;
  }

  const topLevelFiles = files.filter(f => !String(f.webkitRelativePath || '').includes('/'));
  const csvFiles = topLevelFiles.filter(f => (f.name || '').toLowerCase().endsWith('.csv'));
  const jpgFiles = topLevelFiles.filter(f => {
    const n = (f.name || '').toLowerCase();
    return n.endsWith('.jpg') || n.endsWith('.jpeg');
  });

  // Build image map for preview (top-level only)
  jpgFileByName = new Map(jpgFiles.map(f => [f.name, f]));
  jpgHandleByName = new Map();

  const jpgNames = jpgFiles.map(f => f.name).sort((a, b) => a.localeCompare(b));

  if (!jpgNames.length) {
    setStatus('No top-level JPG/JPEG files found in that folder selection.');
    clearImagePreview();
    return;
  }

  // Browser security: can't write into the chosen folder via <input type="file">.
  // Fallback: generate a CSV and download it for the user to place into the folder.
  const chosenCsvName = csvFiles[0]?.name || 'sample.csv';
  setStatus(`Found ${jpgNames.length} JPG(s). Generating ${chosenCsvName} for download (place it into the selected folder)...`);

  (async () => {
    const baseCsv = csvFiles[0]
      ? await csvFiles[0].text()
      : await getBlankCsvText();
    const updated = ensureJpgRowsInCsv(baseCsv, jpgNames);
    downloadTextFile(chosenCsvName, updated);
    // Also load into viewer immediately
    await loadCsvIntoViewer(updated);
    currentDirHandle = null;
    currentCsvFilename = '';
  })().catch(err => setStatus(`Failed to generate CSV: ${err.message}`));
}

async function handleFolderViaFSAccess() {
  if (!('showDirectoryPicker' in window)) {
    setStatus('Your browser does not support folder write access here. Use the file input above (it will download sample.csv if missing).');
    return;
  }

  try {
    setStatus('Pick a folder…');
    // @ts-ignore - not in p5's default typings
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });

    // Collect top-level JPGs and find a CSV (top-level only)
    const jpgNames = [];
    let firstCsvName = null;
    jpgHandleByName = new Map();
    jpgFileByName = new Map();
    // eslint-disable-next-line no-unused-vars
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind !== 'file') continue;
      const lower = String(name).toLowerCase();
      if (!firstCsvName && lower.endsWith('.csv')) firstCsvName = String(name);
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        jpgNames.push(String(name));
        jpgHandleByName.set(String(name), handle);
      }
    }

    jpgNames.sort((a, b) => a.localeCompare(b));

    if (!jpgNames.length) {
      setStatus('No top-level JPG/JPEG files found in that folder.');
      clearImagePreview();
      return;
    }

    const targetCsvName = firstCsvName || 'sample.csv';
    setStatus(`Found ${jpgNames.length} JPG(s). Updating ${targetCsvName}…`);

    // Load existing CSV if present, otherwise start from sample.csv template
    let baseCsvText = '';
    if (firstCsvName) {
      const csvHandle = await dirHandle.getFileHandle(firstCsvName, { create: false });
      const file = await csvHandle.getFile();
      baseCsvText = await file.text();
    } else {
      baseCsvText = await getBlankCsvText();
    }

    const updatedCsv = ensureJpgRowsInCsv(baseCsvText, jpgNames);

    const outHandle = await dirHandle.getFileHandle(targetCsvName, { create: true });
    const writable = await outHandle.createWritable();
    await writable.write(updatedCsv);
    await writable.close();
    setStatus(`Done. Wrote ${targetCsvName} with ${jpgNames.length} image_file row(s).`);

    // Load into viewer immediately
    await loadCsvIntoViewer(updatedCsv);
    currentDirHandle = dirHandle;
    currentCsvFilename = targetCsvName;
  } catch (err) {
    // user cancelled or permission denied
    setStatus(`Folder pick cancelled / failed: ${err?.message ?? err}`);
  }
}