precision mediump float;
uniform sampler2D u_pointsTex;
varying vec2 vTexCoord;

/*
void drawPointTex() {
    for (int i = 0; i < 512; i++) {
        vec4 data1 = texelFetch(u_points, ivec2(i, 0), 0);
        vec4 data2 = texelFetch(u_points, ivec2(i, 1), 0);
        
        if (data1.r > 0.5) {
            float x = data1.g;
            float y = data1.b;
            vec3 color = data2.rgb;
        }
    }
}
*/

void main() {
    vec2 uv = vTexCoord;
    vec2 xy = uv * 100.0;
    vec4 col = vec4(uv.x, uv.y, 0.0, 1.0);

    //drawPointTex();
    //col = texture2D(u_points, vTexCoord);

    for (int i = 0; i < 512; i++) {
        vec4 pointData1 = texelFetch(u_pointsTex, ivec2(i, 0), 0);
        vec4 pointData2 = texelFetch(u_pointsTex, ivec2(i, 1), 0);

        if (pointData1.r > 0.5) {
            float px = pointData1.g * 100.0;
            float py = pointData1.b * 100.0;
            vec3 pColor = pointData2.rgb;
        }
    }
    gl_FragColor = col;
}