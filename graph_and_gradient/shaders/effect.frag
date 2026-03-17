precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_extras[2];
varying vec2 vTexCoord;

float s = u_extras[0] * 10.0;
float n = u_extras[1] * 0.2;
//float x = u_extras[2];

//https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//github - patriciogonzalezvivo/GLSL-Noise.md
//float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}



void main() {
    vec2 uv = vTexCoord;
    vec4 cur = texture2D(u_tex, uv);
    vec4 col = vec4(0.0);


    if (cur.w > 0.0){

        //adapted from https://www.shadertoy.com/view/Xltfzj
        //Gaussian Blur Simple and Fast - Created by existical in 2018-10-23 

        float sizePx = pow(1.0 + s, 2.0);
        const int DIRECTIONS = 16;
        const int QUALITY = 7;
        const float TAU = 6.28318530718;

        vec2 radius = sizePx / max(u_resolution, vec2(1.0));

        float count = 1.0;

        for (int d = 0; d < DIRECTIONS; d++) {
            float ang = TAU * (float(d) / float(DIRECTIONS));
            vec2 dir = vec2(cos(ang), sin(ang));

            
            vec2 roff = vec2(
                (n * (rand(vec2(uv.x + uv.y+1.11) * 13.6) - 0.5)),
                (n * (rand(vec2(uv.x + uv.y) * 12.3) - 0.5))
                );
            

            for (int q = 1; q <= QUALITY; q++) {
            float t = float(q) / float(QUALITY);
            vec4 pix = texture2D(u_tex, uv + dir * radius * t + roff);
                if (pix.a > 0.0){
                    //pix.a *= (1.0 - (n * rand((uv.x + uv.y) * 12.3)));
                    cur += pix * vec4(pix.a);
                    count += 1.0 * pix.a;
                }
            }
            //cur += roff;
        }
        col = cur / count;
    }

    gl_FragColor = col;
}