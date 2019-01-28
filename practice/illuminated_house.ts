import createREGL from "regl";
import {
  Vec3,
  getProjectionMatrix,
  getViewMatrix,
  getModelMatrix,
  getNormalMatrix,
  Vec3toArray
} from "../coordinate-system/coordinate-system";
const _ = require("lodash");
const parseWFObj = require("wavefront-obj-parser");
const expander = require("expand-vertex-data");
const normals = require("angle-normals");

async function loadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject();
    image.src = imageUrl;
  });
}

function normalizePositionVertices(positions) {
  const max = _.max(positions);
  return positions.map(pos => pos / max);
}

window.onload = async () => {
  const regl = createREGL();

  const houseObj = await fetch(require("./models/house-modern.obj")).then(res =>
    res.text()
  );

  const houseMesh = expander(parseWFObj(houseObj), { facesToTriangles: true });

  const mesh = {
    positions: normalizePositionVertices(houseMesh.positions),
    cells: houseMesh.positionIndices,
    textureCoordinates: houseMesh.uvs.map(
      (uv, i) => (i % 2 === 0 ? uv : 1 - uv) // texture coords assume bottom to top, but opengl assumes top to bottoms
    )
  };

  const houseModel = {
    position: Vec3(0, 0, 0),
    rotation: Vec3(0, 0, 0),
    scale: Vec3(1, 1, 1)
  };

  const camera = {
    position: Vec3(0, 2, 5),
    rotation: Vec3(20, 0, 0)
  };

  const drawImage = regl({
    vert: require("./shaders/house.vert.glsl"),
    frag: require("./shaders/house.frag.glsl"),
    uniforms: {
      texture: regl.texture(
        await loadImage(require("./images/housetexture.jpg"))
      ),
      model: (context, props) => props.model,
      view: (context, props) => props.view,
      projection: (context, props) => props.projection,
      normalMatrix: (context, props) => props.normalMatrix,
      viewPos: (context, props) => props.viewPos
    },
    attributes: {
      position: mesh.positions,
      textureUv: mesh.textureCoordinates,
      normal: normals(_.chunk(mesh.cells, 3), _.chunk(mesh.positions, 3))
    },
    elements: mesh.cells
  });

  regl.frame(context => {
    regl.clear({ depth: 1, color: [0, 0, 0, 1] });

    const projection = getProjectionMatrix(context);
    const view = getViewMatrix(camera);

    const model = getModelMatrix({
      ...houseModel,
      rotation: { ...houseModel.rotation, y: context.tick * 0.1 }
    });

    drawImage({
      model,
      view,
      projection,
      normalMatrix: getNormalMatrix(model),
      viewPos: Vec3toArray(camera.position)
    });
  });
};
