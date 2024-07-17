const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { parseSVG, makeAbsolute } = require("svg-path-parser");

function getPointsFromPath(d, viewBox, numPoints, strokeWidth) {
  const commands = makeAbsolute(parseSVG(d));
  const points = [];
  let x = 0,
    y = 0;

  console.log("SVG Commands:", commands);

  commands.forEach((command) => {
    console.log(`Processing command: ${command.code}`);

    if (command.code === "M" || command.code === "L") {
      x = command.x;
      y = command.y;
      points.push({ x, y });
      console.log(`Added point: (${x}, ${y})`);
    } else if (command.code === "C") {
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
        console.log(`Generated point: (${xt}, ${yt})`);
      }
      x = command.x;
      y = command.y;
    }
  });

  console.log("Initial Path Points:", points);

  const expandedPoints = [];
  points.forEach((point) => {
    for (
      let offsetX = -strokeWidth / 2;
      offsetX <= strokeWidth / 2;
      offsetX++
    ) {
      for (
        let offsetY = -strokeWidth / 2;
        offsetY <= strokeWidth / 2;
        offsetY++
      ) {
        expandedPoints.push({ x: point.x + offsetX, y: point.y + offsetY });
      }
    }
  });

  console.log("Expanded Path Points:", expandedPoints);

  return expandedPoints;
}

async function stretchImageAlongCurve(attachment, scale) {
  const img = await loadImage(attachment.url);
  const canvas = createCanvas(scale, scale);
  const ctx = canvas.getContext("2d");

  const viewBox = { x: 0, y: 0, width: 36, height: 36 };
  const svgPath = "M 9.08 36 C 9.08 21.12 21.13 9.07 36 9.04";
  const strokeWidth = 18;
  const numPoints = attachment.height; // Adjust this for better resolution
  const pathPoints = getPointsFromPath(
    svgPath,
    viewBox,
    numPoints,
    strokeWidth
  );

  console.log(`Image Dimensions: ${attachment.width}x${attachment.height}`);
  console.log(`Path Points: ${pathPoints.length}`);

  const offscreenCanvas = createCanvas(attachment.width, attachment.height);
  const offscreenCtx = offscreenCanvas.getContext("2d");
  offscreenCtx.drawImage(img, 0, 0);

  const imgData = offscreenCtx.getImageData(
    0,
    0,
    attachment.width,
    attachment.height
  );

  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];
    const srcX = Math.floor((i / pathPoints.length) * attachment.width);
    const srcY = Math.floor(attachment.height / 2); // Middle of the image to create a stretch effect

    if (
      srcX < 0 ||
      srcX >= attachment.width ||
      srcY < 0 ||
      srcY >= attachment.height
    ) {
      continue;
    }

    const pixelIndex = (srcY * attachment.width + srcX) * 4;
    const r = imgData.data[pixelIndex];
    const g = imgData.data[pixelIndex + 1];
    const b = imgData.data[pixelIndex + 2];
    const a = imgData.data[pixelIndex + 3];

    const destX = Math.floor((point.x - viewBox.x) * (scale / viewBox.width));
    const destY = Math.floor((point.y - viewBox.y) * (scale / viewBox.height));

    if (destX < 0 || destX >= scale || destY < 0 || destY >= scale) {
      continue;
    }

    ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
    ctx.fillRect(destX, destY, 1, 1);
  }

  return canvas;
}

module.exports = { stretchImageAlongCurve };
