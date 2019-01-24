precision mediump float;
uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPos, viewPos;
varying vec3 vnormal;
varying vec3 fragPos;

void main() {

  vec3 norm = normalize(vnormal);
  vec3 lightDir = normalize(lightPos - fragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  float specularStrength = 0.5;
  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);

  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = specularStrength * spec * lightColor;


  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * lightColor;
  gl_FragColor = vec4((ambient + diffuse + specular) * objectColor, 1.0);
}