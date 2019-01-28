uniform mat4 model, projection, view;
precision mediump float;
attribute vec3 position, normal;
attribute vec2 textureUv;
uniform mat3 normalMatrix;
varying vec2 uv;
varying vec3 vnormal;
varying vec3 fragPos;


void main () {
  uv = textureUv;
  vnormal = normalMatrix * normal;
  fragPos = vec3(model * vec4(position, 1.0));
  gl_Position = projection * view * model * vec4(position, 1);
}