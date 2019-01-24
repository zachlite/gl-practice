precision mediump float;
uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPos, viewPos;
varying vec3 vnormal;
varying vec3 fragPos;


struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

uniform Material material;

void main() {

  vec3 norm = normalize(vnormal);
  vec3 lightDir = normalize(lightPos - fragPos);

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = material.diffuse * diff * lightColor;

  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);

  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
  vec3 specular = material.specular * spec * lightColor;

  vec3 ambient = material.ambient * lightColor;
  gl_FragColor = vec4((ambient + diffuse + specular) * objectColor, 1.0);
}