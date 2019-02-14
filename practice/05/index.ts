// 3d relief

// normalize model to 1 x 1 x 1
// iteratively increase probe depth until it contacts mesh's surface
// invert this depth and use as height of cube

const bunny = require("bunny");
import cube from "../models/cube";
import plane from "../models/plane";
import * as _ from "lodash";

const normals = require("angle-normals");
import * as glMatrix from "gl-matrix";
const mat4 = glMatrix.mat4;
const regl = require("regl")({ extensions: "oes_texture_float" });
const camera = require("regl-camera")(regl, {
  center: [0, 0, 0],
  eye: [0, 0, 0]
});

function Mesh(positions, elements) {
  return {
    draw: regl({
      uniforms: {
        ucolor: (_, props) => props.color,
        worldPosition: (_, props) => props.position,
        model: (_, props) => {
          let model = mat4.create();
          mat4.translate(model, model, props.position);
          mat4.rotateX(model, model, (Math.PI / 180) * props.rotation || 0);
          mat4.scale(model, model, props.scale);
          return model;
        }
      },
      attributes: {
        position: positions,
        normal: normals(elements, positions)
      },
      elements
    })
  };
}

function normalizeVertices(vertices) {
  const max: number = _.max(_.flattenDeep(vertices));
  return vertices.map(pos => pos.map(n => n / max));
}

const planeMesh = Mesh(plane.positions, plane.cells);
const cubeMesh = Mesh(_.flatten(cube.positions), cube.cells);
const bunnyMesh = Mesh(normalizeVertices(bunny.positions), bunny.cells);

// 100 cells in a 1x1
const cells = 8192;
const cellWidth = 1 / Math.sqrt(cells);

// offset
// for all x, subtract the width / 2
// for all y, subtract the width / 2

const pins = _.flatten(
  _.range(Math.sqrt(cells)).map(i => {
    return _.range(Math.sqrt(cells)).map(j => {
      const spacing = 1.75;
      const posX = i * cellWidth * spacing;
      const posY = j * cellWidth * spacing;
      const offset = (cellWidth * spacing * Math.sqrt(cells)) / 2;

      return {
        position: [posX - offset, 0.5, posY - offset],
        scale: [cellWidth / 2, 0.5, cellWidth / 2],
        color: [Math.random(), Math.random(), 1]
      };
    });
  })
);

const globalScope = regl({
  uniforms: {
    lightPosition: [0, 3, 3],
    depthView: () => {
      return mat4.lookAt(mat4.create(), [0, 1, 0.01], [0, 0, 0], [0, 1, 0]);
    },
    depthProjection: () => {
      const projDim = 1;
      return mat4.ortho(
        mat4.create(),
        -projDim,
        projDim,
        -projDim,
        projDim,
        -projDim,
        projDim
      );
    },
    eyePosition: camera.center
  }
});

const DEPTH_MAP_RES = 1024;

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
  frag: `
  precision mediump float;
  varying vec3 vPosition;
  void main () {
    gl_FragColor = vec4(vec3(vPosition.z), 1.0);
  }`,
  vert: `
  precision mediump float;
  attribute vec3 position;
  uniform mat4 depthProjection, depthView, model;
  varying vec3 vPosition;
  void main() {
    vec4 p = depthProjection * depthView * model * vec4(position, 1.0);
    gl_Position = p;
    vPosition = p.xyz;
  }`,
  framebuffer: fbo
});

const drawMesh = regl({
  frag: require("./frag.glsl"),
  vert: require("./vert.glsl")
});

const drawRelief = regl({
  frag: require("./relief.frag.glsl"),
  vert: require("./relief.vert.glsl"),
  uniforms: {
    depthMap: fbo
  }
});

const bunnyProps = {
  position: [0, 0, 0],
  scale: [1, 1, 1],
  color: [1, 0, 1]
};

function lerp(v0, v1, t) {
  return (1 - t) * v0 + t * v1;
}

regl.frame(({ tick }) => {
  regl.clear({ color: [1, 1, 1, 1], depth: true });
  regl.clear({ color: [0, 0, 0, 1], depth: true, framebuffer: fbo });

  const bunnyPropsUpdate = {
    ...bunnyProps,
    position: [0, lerp(-1, 0, Math.abs(Math.cos(tick * 0.02))), 0]
  };

  camera(() => {
    globalScope(() => {
      // create a depth map of the bunny
      drawDepth(() => {
        bunnyMesh.draw(bunnyPropsUpdate);
      });

      drawMesh(() => {
        // planeMesh.draw({
        //   position: [0, 0, 0],
        //   scale: [100, 100, 100],
        //   color: [1, 1, 1]
        // });
        // bunnyMesh.draw(bunnyPropsUpdate);
      });

      drawRelief(() => {
        cubeMesh.draw(pins);
      });
    });
  });
});
