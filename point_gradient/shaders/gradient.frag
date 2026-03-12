precision highp float;
uniform sampler2D u_pointPosTex;
uniform sampler2D u_pointColTex;

uniform float u_pointTexSize;
uniform float u_extras[4];
varying vec2 vTexCoord;


// Source - https://stackoverflow.com/a/17897228
// Posted by sam hocevar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-12, License - CC BY-SA 4.0

// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Source - https://stackoverflow.com/a/17897228
// Posted by sam hocevar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-12, License - CC BY-SA 4.0

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}



void main() {
    vec2 uv = vTexCoord;
    vec2 xy = uv;
    vec4 col = vec4(uv.x, uv.y, 0.0, 1.0);
    col = vec4(0, 0, 0, 0);

    //drawPointTex();
    //col = texture2D(u_points, vTexCoord);

    vec4 sumHsv = vec4(0.0);
    float rgbHue = 0.0;

    for (int i = 0; i < 512; i++) { 
        vec4 pointDataPos = texture2D(u_pointPosTex, (vec2(float(i), 0.0) + 0.5) / u_pointTexSize);
        vec4 pointDataCol = texture2D(u_pointColTex, (vec2(float(i), 0.0) + 0.5) / u_pointTexSize);
        vec3 pointHsl = vec3( rgb2hsv(pointDataCol.rgb) );

        if (pointDataPos.r > 0.5) {
            float px = pointDataPos.g;
            float py = 1.0 - pointDataPos.b;
            vec3 pColor = pointDataCol.rgb;

            //float dist = distance(xy, vec2(px, py));
            float dist = distance(uv, vec2(px, py));
            //dist = distance(uv, vec2(0.5, 0.5));

            /*
            if (dist < 0.02) {
                col.rgb = pColor;
                col.a = 1.0;
            }
            */

            // atan-based smooth falloff: clamp base to avoid pow(negative, non-integer) = NaN
            // invert so influence is high when close, low when far (1.0 / ...)
            //float atanNorm = ((atan(dist - u_extras[0]) - atan(u_extras[0])) / 3.14159) + 1.0;
            //float influence = 1.0 - pow(max(0.0001, atanNorm), u_extras[1]);
            //float influence = pow(((atan(dist -0 ) - atan(0)) / 3.14159)+1, 1);
            //float influence = 1.0 / pow((dist), u_extras[1] * 10.0) + 0.01 + (u_extras[0] * 10.0);

            //adapted logistic sigmoid function
            float k = u_extras[1] * 100.0;
            float c = u_extras[0] * 1.0;
            float influence = 1.0 - (1.0 / (1.0 + exp(-k * (dist - c))));

            col.rgb += pColor * influence;
            col.a += influence;

            sumHsv.xyz += pointHsl * influence;
            sumHsv.a += influence;

            rgbHue = rgb2hsv(col.rgb).x;

        }
    }
    col.rgb /= col.a + 0.01;
    sumHsv.xyz /= sumHsv.a + 0.01;
    sumHsv.x = rgbHue;
    //sumHsv.z = col.a * 0.01;

    col = vec4(hsv2rgb(sumHsv.rgb), 1.0);
    //col = vec4(col.www, 1.0);
    //col = vec4( texture2D(u_pointPosTex, (vec2(float(xy.x), xy.y) + 0.5) / u_pointTexSize));

    
    
    gl_FragColor = col;
}