precision highp float;

#pragma glslify: orenNayar = require('glsl-diffuse-oren-nayar');
#pragma glslify: blinnPhongSpec = require('glsl-specular-blinn-phong');


uniform vec3 ucolor;
uniform sampler2D depthMap;
uniform vec3 lightPosition, eyePosition;
uniform mat4 depthProjection, depthView;
uniform vec3 worldPosition;

varying vec3 vPosition;
varying vec3 vPositionDepthSpace;
varying vec3 vNormal;



// float lerp(float v0, float v1, float t) {
//   return (1. - t) * v0 + t * v1;
// }


void main() {

  // sample the depth map at the column's center in depth space
  vec4 centerDepthSpace = depthProjection * depthView * vec4(worldPosition, 1.0);
  vec2 sampleCoord = centerDepthSpace.xy * .5 + .5;
  float depth = texture2D(depthMap, sampleCoord).z;


  float alpha = vPositionDepthSpace.z < depth || depth == 0.0 ? 0.0 : 1.0;

  vec3 c1 = vec3(0.9);
  vec3 c2 = vec3(0.0);
  vec3 color = mix(c1, c2, vPositionDepthSpace.z / 1. - depth);

  if (depth == 0. && 1. - vPositionDepthSpace.z <= .05) {
    alpha = 1.0;
    color = c1;
  } 


  // vec3 lightDirection = normalize(lightPosition - vPosition);
  // vec3 viewDirection = normalize(eyePosition - vPosition);
  // vec3 normal = normalize(vNormal);

  // float diffuse = orenNayar(
  //   lightDirection,
  //   viewDirection,
  //   normal,
  //   .75,
  //   1.0
  // );
  
  // float specular = blinnPhongSpec(lightDirection, viewDirection, normal, 8.);



  // lerp alpha between 0 and 1 depending on fragment's height
  

  // float ambient = .1;
  // float light = ambient + diffuse + specular;

  float light = 1.;
  gl_FragColor = vec4(color * light, alpha);
  if (alpha == 0.0) discard;
}



// chosing the alpha doesn't change
// a fragment is only thrown away when all 4 depths are zero when 




