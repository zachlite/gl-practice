const bunny = require("bunny");
import cube from "../models/cube";
import * as _ from "lodash";

import * as glMatrix from "gl-matrix";
import Mesh from "./mesh";
const mat4 = glMatrix.mat4;

function normalizeVertices(vertices) {
  const max: number = _.max(_.flattenDeep(vertices));
  return vertices.map(pos => pos.map(n => n / max));
}

function getCells(cellCount: number) {
  const cellWidth = 1 / Math.sqrt(cellCount);
  return _.flatten(
    _.range(Math.sqrt(cellCount)).map(i => {
      return _.range(Math.sqrt(cellCount)).map(j => {
        const spacing = 1.75;
        const posX = i * cellWidth * spacing;
        const posY = j * cellWidth * spacing;
        const offset = (cellWidth * spacing * Math.sqrt(cellCount)) / 2;

        return {
          position: [posX - offset, 0.5, posY - offset],
          scale: [cellWidth / 2, 0.5, cellWidth / 2]
        };
      });
    })
  );
}

const DEPTH_MAP_RES = 1024;
const depthView = mat4.lookAt(
  mat4.create(),
  [0, 1, 0.01],
  [0, 0, 0],
  [0, 1, 0]
);
const depthProjection = mat4.ortho(mat4.create(), -1, 1, -1, 1, -1, 1);

window.onload = () => {
  let cellCount = 1024;
  let showBunnyMesh = false;
  let translateX = 0;
  let translateY = 0;
  let translateZ = 0;

  document.getElementById("cell-count").addEventListener("input", e => {
    cellCount = Math.pow(2, e.target.value);
    document.getElementById(
      "cell-count-label"
    ).innerHTML = cellCount.toString();
  });

  document.getElementById("show-bunny").addEventListener("change", e => {
    showBunnyMesh = e.target.checked;
  });

  document.getElementById("translate-x").addEventListener("input", e => {
    translateX = e.target.value;
  });

  document.getElementById("translate-y").addEventListener("input", e => {
    translateY = e.target.value;
  });

  document.getElementById("translate-z").addEventListener("input", e => {
    translateZ = e.target.value;
  });

  const canvas = document.getElementById("canvas");
  const regl = require("regl")({ canvas, extensions: "oes_texture_float" });
  const camera = require("regl-camera")(regl, {
    center: [0, 0, 0],
    eye: [0, 0, 0]
  });

  const globalScope = regl({
    uniforms: {
      lightPosition: [0, 3, 3],
      depthView,
      depthProjection,
      eyePosition: camera.center
    }
  });

  const fbo = regl.framebuffer({
    color: regl.texture({
      width: DEPTH_MAP_RES,
      height: DEPTH_MAP_RES,
      wrap: "clamp",
      type: "float"
    }),
    depth: true
  });

  const drawDepth = regl({
    frag: require("./shaders/depth.frag.glsl"),
    vert: require("./shaders/depth.vert.glsl"),
    framebuffer: fbo
  });

  const drawMesh = regl({
    frag: require("./shaders/mesh.frag.glsl"),
    vert: require("./shaders/mesh.vert.glsl")
  });

  const drawRelief = regl({
    frag: require("./shaders/relief.frag.glsl"),
    vert: require("./shaders/relief.vert.glsl"),
    uniforms: {
      depthMap: fbo
    }
  });

  const cubeMesh = Mesh(regl, _.flatten(cube.positions), cube.cells);
  const bunnyMesh = Mesh(regl, normalizeVertices(bunny.positions), bunny.cells);

  regl.frame(({ tick }) => {
    regl.clear({ color: [1, 1, 1, 1], depth: true });
    regl.clear({ color: [0, 0, 0, 1], depth: true, framebuffer: fbo });

    const bunnyPropsUpdate = {
      scale: [1, 1, 1],
      color: [1, 0, 1],
      position: [translateX, translateY, translateZ]
    };

    camera(() => {
      globalScope(() => {
        // create a depth map of the bunny
        drawDepth(() => {
          bunnyMesh.draw(bunnyPropsUpdate);
        });

        if (showBunnyMesh) {
          drawMesh(() => {
            bunnyMesh.draw(bunnyPropsUpdate);
          });
        }

        drawRelief(() => {
          cubeMesh.draw(getCells(cellCount));
        });
      });
    });
  });
};
