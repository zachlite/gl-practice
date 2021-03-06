import * as glMatrix from "gl-matrix";
const mat4 = glMatrix.mat4;
const mat3 = glMatrix.mat3;

import createREGL from "regl";
import cube from "./models/cube";
import {
  Vec3toArray,
  Vec3,
  getProjectionMatrix,
  getModelMatrix,
  getViewMatrix,
  getNormalMatrix
} from "../coordinate-system/coordinate-system";

const normals = require("angle-normals");
const bunnyMesh = require("bunny");
const bunnyVert = require("./shaders/bunny.vert.glsl");
const bunnyFrag = require("./shaders/bunny.frag.glsl");
const lightVert = require("./shaders/lightsource.vert.glsl");
const lightFrag = require("./shaders/lightsource.frag.glsl");

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
      "lightPositions[0]": (
        context,
        props // TODO: don't hardcode array indices.
      ) => Vec3toArray(props.lightPositions[0]),
      "lightPositions[1]": (context, props) =>
        Vec3toArray(props.lightPositions[1]),
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
    position: Vec3(0, 20, 40),
    rotation: Vec3(20, 0, 0)
  };

  const bunny = {
    position: Vec3(0, 0, 0),
    rotation: Vec3(0, 0, 0),
    scale: Vec3(0.5, 0.5, 0.5)
  };

  // array of positions
  // assume rotation and scale
  const lightPositions = [Vec3(-10, 0, 0), Vec3(10, 0, -50)];

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

    const bunnyModel = getModelMatrix({
      ...bunny,
      position: {
        ...bunny.position,
        z: 25 * Math.cos(context.tick * 0.025) * -1 - 25
      }
    });

    const view = getViewMatrix(camera);

    drawBunny({
      model: bunnyModel,
      normalMatrix: getNormalMatrix(bunnyModel),
      view,
      viewPos: camera.position,
      projection,
      lightPositions,
      material: bunnyMaterial
    });

    const lightSourceProps = lightPositions.map(light => {
      return {
        model: getModelMatrix({
          position: light,
          rotation: Vec3(0, 0, 0),
          scale: Vec3(1, 1, 1)
        }),
        view,
        projection
      };
    });

    // batch draw
    drawLightSource(lightSourceProps);
  });
};
