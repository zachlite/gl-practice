attribute vec3 position, normal;
varying vec3 vnormal, fragPos;
uniform mat4 model, view, projection;
uniform mat3 normalMatrix;


void main() {
  vnormal = normalMatrix * normal;
  fragPos = vec3(model * vec4(position, 1.0));
  gl_Position = projection * view * model * vec4(position, 1);
}