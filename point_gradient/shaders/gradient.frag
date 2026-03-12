precision highp float;
uniform sampler2D u_pointPosTex;
uniform sampler2D u_pointColTex;


uniform float u_pointTexSize;
varying vec2 vTexCoord;


void main() {
    vec2 uv = vTexCoord;
    vec2 xy = uv;
    vec4 col = vec4(uv.x, uv.y, 0.0, 1.0);
    col = vec4(0, 0, 0, 0);

    //drawPointTex();
    //col = texture2D(u_points, vTexCoord);

    for (int i = 0; i < 512; i++) { 
        vec4 pointDataPos = texture2D(u_pointPosTex, (vec2(float(i), 0.0) + 0.5) / u_pointTexSize);
        vec4 pointDataCol = texture2D(u_pointColTex, (vec2(float(i), 1.0) + 0.5) / u_pointTexSize);

        if (pointDataPos.r > 0.5) {
            float px = pointDataPos.g;
            float py = pointDataCol.b;
            vec3 pColor = pointDataCol.rgb;

            //float dist = distance(xy, vec2(px, py));
            float dist = distance(uv, vec2(px, py));

            if (dist < 0.02) {
                col.rgb = pColor;
                col.a = 1.0;
            }

            //float influence = 1.0 / (dist + 0.01);
            //col.rgb += pColor * influence;
            //col.a += influence;
        }
    }

    //col = vec4( texture2D(u_pointPosTex, (vec2(float(xy.x), xy.y) + 0.5) / u_pointTexSize));

    //col.rgb /= col.a + 0.01;
    gl_FragColor = col;
}