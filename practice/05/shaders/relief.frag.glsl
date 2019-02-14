precision highp float;

uniform sampler2D depthMap;
uniform vec3 lightPosition, eyePosition;
uniform mat4 depthProjection, depthView;
uniform vec3 worldPosition;

varying vec3 vPosition;
varying vec3 vPositionDepthSpace;
varying vec3 vNormal;


void main() {

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

  gl_FragColor = vec4(color, alpha);
  if (alpha == 0.0) discard;
}

