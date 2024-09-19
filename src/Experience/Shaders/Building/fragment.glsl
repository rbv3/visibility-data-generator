uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uMaxHeight;

varying float vHeight;
varying vec2 vUv;

void main() {
    float mixStrength = vHeight; 
    
    vec3 color = mix(uColorA, uColorB, max(0.0, (vHeight * 1.25 / uMaxHeight) - 0.5) * 2.0);
    
    gl_FragColor = vec4(color, 1.0);
}