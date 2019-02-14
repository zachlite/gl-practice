import * as glMatrix from "gl-matrix";
const mat4 = glMatrix.mat4;
const normals = require("angle-normals");

export default function Mesh(regl, positions, elements) {
  return {
    draw: regl({
      uniforms: {
        ucolor: (_, props) => props.color,
        worldPosition: (_, props) => props.position,
        model: (_, props) => {
          let model = mat4.create();
          mat4.translate(model, model, props.position);
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
