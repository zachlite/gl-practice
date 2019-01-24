precision mediump float;
uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPos;
varying vec3 vnormal;
varying vec3 fragPos;

void main() {

  vec3 norm = normalize(vnormal);
  vec3 lightDir = normalize(lightPos - fragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * lightColor;
  gl_FragColor = vec4((ambient + diffuse) * objectColor, 1.0);
}