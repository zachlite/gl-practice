precision mediump float;
varying vec2 uv;
uniform sampler2D texture;

uniform vec3 viewPos;
varying vec3 vnormal;
varying vec3 fragPos;


vec3 calcDirLight(vec3 lightDir, vec3 normal, vec3 viewDir) {
  vec3 lightColor = vec3(1.0); // assume light color;

  // diffuse
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * lightColor;

  // specular
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = spec * lightColor;

  // ambient 
  vec3 ambient = 0.1 * lightColor;

  return (ambient + diffuse + specular);
}


void main() {
  vec3 normal = normalize(vnormal);
  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 lightDir = normalize(vec3(-100, 50, 0));
  vec3 light = calcDirLight(lightDir, normal, viewDir);
  gl_FragColor = mix(texture2D(texture, uv), vec4(light, 1.0), 0.5);
}