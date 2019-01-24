// const bunny = require("bunny");
import * as glMatrix from "gl-matrix";
const mat4 = glMatrix.mat4;
const mat3 = glMatrix.mat3;
import createREGL from "regl";
import cube from "./models/cube";

const normals = require("angle-normals");
const bunnyMesh = require("bunny");
const bunnyVert = require("./shaders/bunny.vert.glsl");
const bunnyFrag = require("./shaders/bunny.frag.glsl");
const lightVert = require("./shaders/lightsource.vert.glsl");
const lightFrag = require("./shaders/lightsource.frag.glsl");

function Vec3(x, y, z) {
  return { x, y, z };
}

function Vec3toArray(vec3) {
  return [vec3.x, vec3.y, vec3.z];
}

function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}

function getModelMatrix({ position, rotation, scale }) {
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

function getViewMatrix({ position, rotation }) {
  let viewMatrix = mat4.create();
  mat4.rotateX(viewMatrix, viewMatrix, degreeToRadian(rotation.x));
  mat4.rotateY(viewMatrix, viewMatrix, degreeToRadian(rotation.y));
  mat4.translate(viewMatrix, viewMatrix, [
    position.x,
    position.y,
    position.z * -1
  ]);
  return viewMatrix;
}

function getNormalMatrix(model: glMatrix.mat4) {
  // mat3(transpose(invert(model)))
  // need to do lighting calculations in world space,
  // but translations shouldn't effect normal vectors
  return mat3.fromMat4(
    mat3.create(),
    mat4.transpose(mat4.create(), mat4.invert(mat4.create(), model))
  );
}

function getProjectionMatrix({ viewportWidth, viewportHeight }) {
  return mat4.perspective(
    [] as any,
    Math.PI / 4, // 45 degrees
    viewportWidth / viewportHeight,
    0.01,
    1000
  );
}

window.onload = () => {
  const regl = createREGL();
  const lightColor = [1, 1, 1];

  const drawLightSource = regl({
    vert: lightVert,
    frag: lightFrag,
    uniforms: {
      model: (context, props) => props.model,
      view: (context, props) => props.view,
      projection: (context, props) => props.projection,
      lightColor
    },
    attributes: {
      position: cube.positions
    },
    elements: cube.cells
  });

  const drawBunny = regl({
    vert: bunnyVert,
    frag: bunnyFrag,
    uniforms: {
      model: (context, props) => props.model,
      view: (context, props) => props.view,
      projection: (context, props) => props.projection,
      normalMatrix: (context, props) => props.normalMatrix,
      objectColor: [1, 0, 0],
      lightColor,
      viewPos: (context, props) => Vec3toArray(props.viewPos),
      lightPos: (context, props) => Vec3toArray(props.lightPos),
      "material.ambient": (context, props) => props.material.ambient,
      "material.diffuse": (context, props) => props.material.diffuse,
      "material.specular": (context, props) => props.material.specular,
      "material.shininess": (context, props) => props.material.shininess
    },
    attributes: {
      position: bunnyMesh.positions,
      normal: normals(bunnyMesh.cells, bunnyMesh.positions)
    },
    elements: bunnyMesh.cells
  });

  const camera = {
    position: Vec3(0, 0, 40),
    rotation: Vec3(0, 0, 0)
  };

  const bunny = {
    position: Vec3(0, 0, -10),
    rotation: Vec3(0, 0, 0),
    scale: Vec3(1, 1, 1)
  };

  const lightSource = {
    position: Vec3(10, 10, 0),
    rotation: Vec3(0, 0, 0),
    scale: Vec3(1, 1, 1)
  };

  const bunnyMaterial = {
    ambient: [0.1, 0.1, 0.1],
    diffuse: [0.8, 0.8, 0.8],
    specular: [0.25, 0.25, 0.25],
    shininess: 32.0
  };

  regl.frame(context => {
    regl.clear({
      depth: 1,
      color: [0, 0, 0, 1]
    });

    const projection = getProjectionMatrix(context);

    const lightPos = {
      ...lightSource.position,
      x: 10 * Math.cos(context.tick * 0.025),
      z: 10 * Math.sin(context.tick * 0.025)
    };

    const bunnyModel = getModelMatrix({
      ...bunny,
      rotation: { ...bunny.rotation, y: context.tick * 0 }
    });

    drawBunny({
      model: bunnyModel,
      normalMatrix: getNormalMatrix(bunnyModel),
      view: getViewMatrix(camera),
      viewPos: camera.position,
      projection,
      lightPos: lightPos,
      material: bunnyMaterial
    });

    drawLightSource({
      model: getModelMatrix({
        ...lightSource,
        position: lightPos
      }),
      view: getViewMatrix(camera),
      projection
    });
  });
};
