precision highp float;
uniform mat4 depthProjection, depthView;
uniform mat4 projection, view, model;

attribute vec3 position, normal;
varying vec3 vPosition, vNormal;
varying vec3 vPositionDepthSpace;


void main() {
  vPosition = position;
  vNormal = normal;

  vec4 worldPos = model * vec4(position, 1.0);
  gl_Position = projection * view * worldPos;
  vPositionDepthSpace = (depthProjection * depthView * worldPos).xyz;
}