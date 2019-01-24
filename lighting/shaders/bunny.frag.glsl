precision mediump float;
uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 viewPos;
varying vec3 vnormal;
varying vec3 fragPos;

#define NUM_POINT_LIGHTS 2
uniform vec3 lightPositions[NUM_POINT_LIGHTS];


struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

uniform Material material;

vec3 calcPointLight(vec3 lightPos, vec3 normal, vec3 fragPos, vec3 viewDir) {
  vec3 lightDir = normalize(lightPos - fragPos);

  // ambient light
  vec3 ambient = material.ambient * lightColor;


  // diffuse light
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = material.diffuse * diff * lightColor;

  // specular light
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
  vec3 specular = material.specular * spec * lightColor;

  // attenuation
  float dist  = length(lightPos - fragPos);
  float attenuation = 1.0 / (1.0 + (0.014 * dist)  + (0.0007 * dist * dist));

  ambient *= attenuation;
  diffuse *= attenuation;
  specular *= attenuation;

  return ambient + diffuse + specular;
}

void main() {

  vec3 norm = normalize(vnormal);
  vec3 viewDir = normalize(viewPos - fragPos);

  vec3 result = vec3(0);
  for(int i = 0; i < NUM_POINT_LIGHTS; i++) {
    result += calcPointLight(lightPositions[i], norm, fragPos, viewDir); 
  }

  gl_FragColor = vec4(result * objectColor, 1.0);
}