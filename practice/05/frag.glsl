precision highp float;

#pragma glslify: orenNayar = require('glsl-diffuse-oren-nayar');
#pragma glslify: blinnPhongSpec = require(glsl-specular-blinn-phong) 

uniform vec3 ucolor;

uniform vec3 lightPosition, eyePosition;
varying vec3 vPosition, vNormal;

void main() {

  vec3 lightDirection = normalize(lightPosition - vPosition);
  vec3 viewDirection = normalize(eyePosition - vPosition);
  vec3 normal = normalize(vNormal);

  float diffuse = orenNayar(
    lightDirection,
    viewDirection,
    normal,
    1.0,
    1.0
  );

  // float specular = 0.0;
  float specular = blinnPhongSpec(
    lightDirection,
    viewDirection,
    normal,
    8.0
  );


  float ambient = .2;
  float light = diffuse + ambient + specular;
  // float light = 1.0;
  gl_FragColor = vec4(light * ucolor, 1.0);
}