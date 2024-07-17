const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { parseSVG, makeAbsolute } = require("svg-path-parser");

// Function to get points from SVG path
function getPointsFromPath(d, viewBox, numPoints) {
  const commands = makeAbsolute(parseSVG(d));
  const points = [];
  let x = 0,
    y = 0;

  commands.forEach((command) => {
    if (command.command === "M" || command.command === "L") {
      x = command.x;
      y = command.y;
    } else if (command.command === "C") {
      for (let t = 0; t <= 1; t += 1 / numPoints) {
        const xt =
          (1 - t) * (1 - t) * (1 - t) * x +
          3 * (1 - t) * (1 - t) * t * command.x1 +
          3 * (1 - t) * t * t * command.x2 +
          t * t * t * command.x;
        const yt =
          (1 - t) * (1 - t) * (1 - t) * y +
          3 * (1 - t) * (1 - t) * t * command.y1 +
          3 * (1 - t) * t * t * command.y2 +
          t * t * t * command.y;
        points.push({ x: xt, y: yt });
      }
      x = command.x;
      y = command.y;
    }
  });

  return points;
}

async function stretchImageAlongCurve(attachment, scale) {
  const img = await loadImage(attachment.url);
  const canvas = createCanvas(scale, scale);
  const ctx = canvas.getContext("2d");

  const viewBox = { x: 0, y: 0, width: 36, height: 36 };
  const svgPath = "M 36.00,-0.00 C 16.12,-0.00 -0.00,16.12 -0.00,36.00 -0.00,36.00 18.04,36.00 18.04,36.00 18.04,26.08 26.08,18.04 36.00,18.04 36.00,18.04 36.00,-0.00 36.00,-0.00 Z";
  const numPoints = scale; // Adjust based on desired resolution
  const pathPoints = getPointsFromPath(svgPath, viewBox, numPoints);

  // Draw the image to an offscreen canvas
  const offscreenCanvas = createCanvas(attachment.width, attachment.height);
  const offscreenCtx = offscreenCanvas.getContext("2d");
  offscreenCtx.drawImage(img, 0, 0);

  // Get image data
  const imgData = offscreenCtx.getImageData(0, 0, attachment.width, attachment.height);

  // Debug log: Image dimensions
  console.log(`Image Dimensions: ${attachment.width}x${attachment.height}`);
  console.log(`Canvas Dimensions: ${scale}x${scale}`)
  console.log(`Path Points: ${pathPoints.length}`);

  // Map image data to the path
  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];
    const srcX = Math.floor(i * (attachment.width / numPoints));
    const srcY = Math.floor(
      (point.y - viewBox.y) * (attachment.height / viewBox.height)
    );

    // Debug log: Source coordinates and pixel index
    console.log(`Src (x, y): (${srcX}, ${srcY})`);
    console.log(`Pixel Index: ${srcY * attachment.width + srcX}`);

    const pixelIndex = (srcY * attachment.width + srcX) * 4;
    const r = imgData.data[pixelIndex];
    const g = imgData.data[pixelIndex + 1];
    const b = imgData.data[pixelIndex + 2];
    const a = imgData.data[pixelIndex + 3];

    // Debug log: Pixel color values
    console.log(`Pixel Color: rgba(${r},${g},${b},${a / 255})`);

    const destX = Math.floor((point.x - viewBox.x) * (width / viewBox.width));
    const destY = Math.floor((point.y - viewBox.y) * (height / viewBox.height));

    // Debug log: Destination coordinates
    console.log(`Dest (x, y): (${destX}, ${destY})`);

    ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
    ctx.fillRect(destX, destY, 1, 1);
  }

  return canvas;
}

module.exports = { stretchImageAlongCurve };
