const texSize = 128;

function loadGradient(table, priceRange=[0,1]){

  pointPosTex = createGraphics(texSize, 1);
  pointPosTex.pixelDensity(1);
  pointPosTex.loadPixels();
  
  pointColTex = createGraphics(texSize, 1);
  pointColTex.pixelDensity(1);
  pointColTex.loadPixels();

  for (let i = 0; i < texSize; i++){
    if (i < (table.length)){
      let ix = i * 4;

      let x = float(table[i][0]);
      let y = 1-float(table[i][1]);
      let col = hexToRgb(table[i][2]);
      console.log('row', i, 'x', x, 'y', y, 'col', col);

      pointPosTex.pixels[ix + 0] = 255;
      pointPosTex.pixels[ix + 1] = x * 255;
      pointPosTex.pixels[ix + 2] = y * 255;
      pointPosTex.pixels[ix + 3] = 255;
      
      pointColTex.pixels[ix + 0] = col[0];
      pointColTex.pixels[ix + 1] = col[1];
      pointColTex.pixels[ix + 2] = col[2];
      pointColTex.pixels[ix + 3] = 255;
      
    } else {
      for (let j = 0; j < 4; j++){
        pointPosTex.pixels[i*4 + j] = 0;
        pointColTex.pixels[i*4 + j] = 100;

        console.log('row', i, '---blank---')
      }
    }
  }


  pointPosTex.updatePixels();
  pointColTex.updatePixels();

}

function drawGradient(x = -200, y = -200, w = 400, h = 400, val1 = 0.33, val2 = 0.86, val3 = 0.7, val4 = 0.5){
  console.log('drawing gradient at:', x, y, 'with dimensions:', w, h, 'val1:', val1, 'val2:', val2, 'val3:', val3, 'val4:', val4);

  gradientBuffer.shader(gradient);
  gradient.setUniform('u_pointPosTex', pointPosTex);
  gradient.setUniform('u_pointColTex', pointColTex);
  gradient.setUniform('u_pointTexSize', [texSize]);
  gradient.setUniform('u_extras', [val1, val2]);

  pointPosTex.textureFiltering = NEAREST;
  pointColTex.textureFiltering = NEAREST;

  gradientBuffer.quad(
    2 * x / width, 2 * y / height,
    2 * (w + x) / width, 2 * y / height,
    2 * (w + x) / width, 2 * (h + y) / height,
    2 * x / width, 2 * (h + y) / height
  );

  shader(effect);
  effect.setUniform('u_tex', gradientBuffer);
  effect.setUniform('u_resolution', [width, height]);
  effect.setUniform('u_extras', [val3, val4]);

  quad(-1, -1, 1, -1, 1, 1, -1, 1);
}

function gradientTest(){

  textureMode(IMAGE);
  texture(pointColTex);

  rect(-200, 0, 400, 200);

  textureMode(IMAGE);
  texture(pointPosTex); 

  rect(-200, -200, 400, 200);
  
}


function hexToRgb(hex) {
  hex = hex.replace('#', '');

  var bigint = parseInt(hex, 16);

  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return [r, g, b];
}