precision highp float;
uniform mat4 projection, view, model;
attribute vec3 position, normal;
varying vec3 vPosition, vNormal;
void main() {
  vPosition = position;
  vNormal = normal;
  gl_Position = projection * view * model * vec4(position, 1.0);
}