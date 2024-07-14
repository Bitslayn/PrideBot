const CanvasAPI = require("@napi-rs/canvas");

async function convertImageToFlag(attachment, scale, crop) {
  const height = scale * 0.72265625; // height = 370
  function findWidth() { // width = 512
    if (crop == "0full") {
      return scale;
    } else {
      return (height * attachment.width) / attachment.height;
    }
  }
  const width = findWidth();

  const dx = ((width - scale) / 2) * parseInt(crop);
  const dy = (scale - height) / 2;

  const canvas = CanvasAPI.createCanvas(scale, scale);
  const context = canvas.getContext('2d');
  const mask = await CanvasAPI.loadImage("./src/masks/flag.png");
  context.drawImage(mask, 0, 0);
  context.globalCompositeOperation = "source-in";
  const flag = await CanvasAPI.loadImage(attachment.url);
  context.drawImage(flag, dx, dy, width, height);
  return canvas;
}

module.exports = { convertImageToFlag };