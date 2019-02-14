precision mediump float;
attribute vec3 position;
uniform mat4 depthProjection, depthView, model;
varying vec3 vPosition;
void main() {
  vec4 p = depthProjection * depthView * model * vec4(position, 1.0);
  gl_Position = p;
  vPosition = p.xyz;
}