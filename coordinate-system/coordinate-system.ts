import * as glMatrix from "gl-matrix";
const mat4 = glMatrix.mat4;
const mat3 = glMatrix.mat3;

export function Vec3(x, y, z) {
  return { x, y, z };
}

export function Vec3toArray(vec3) {
  return [vec3.x, vec3.y, vec3.z];
}

export function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}

export function getNormalMatrix(model: glMatrix.mat4) {
  // mat3(transpose(invert(model)))
  // need to do lighting calculations in world space,
  // but translations shouldn't effect normal vectors
  return mat3.fromMat4(
    mat3.create(),
    mat4.transpose(mat4.create(), mat4.invert(mat4.create(), model))
  );
}

export function getModelMatrix({ position, rotation, scale }) {
  const modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [
    position.x,
    position.y,
    position.z
  ]);
  mat4.rotateX(modelMatrix, modelMatrix, degreeToRadian(rotation.x));
  mat4.rotateY(modelMatrix, modelMatrix, degreeToRadian(rotation.y));
  mat4.rotateZ(modelMatrix, modelMatrix, degreeToRadian(rotation.z));
  mat4.scale(modelMatrix, modelMatrix, [scale.x, scale.y, scale.z]);
  return modelMatrix;
}

export function getViewMatrix({ position, rotation }) {
  let viewMatrix = mat4.create();
  mat4.rotateX(viewMatrix, viewMatrix, degreeToRadian(rotation.x));
  mat4.rotateY(viewMatrix, viewMatrix, degreeToRadian(rotation.y));
  mat4.translate(viewMatrix, viewMatrix, [
    position.x,
    position.y * -1,
    position.z * -1
  ]);
  return viewMatrix;
}

export function getProjectionMatrix({ viewportWidth, viewportHeight }) {
  return mat4.perspective(
    [] as any,
    Math.PI / 4, // 45 degrees
    viewportWidth / viewportHeight,
    0.01,
    1000
  );
}
