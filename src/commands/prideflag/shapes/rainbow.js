const { createCanvas, loadImage } = require("@napi-rs/canvas");

function mapToCurve(x, y, width, height) {
    const angle = (x / width) * Math.PI * 2;
    const radius = height / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const curvedX = centerX + radius * Math.cos(angle);
    const curvedY = centerY + radius * Math.sin(angle) - y; // Adjust for y-axis

    return { x: curvedX, y: curvedY };
}

async function stretchImageAlongCurve(imageUrl, width, height) {
    const img = await loadImage(imageUrl);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw the image to an offscreen canvas
    const offscreenCanvas = createCanvas(img.width, img.height);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(img, 0, 0);

    // Get image data
    const imgData = offscreenCtx.getImageData(0, 0, img.width, img.height);

    // Draw the transformed image
    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            const pixelIndex = (y * img.width + x) * 4;
            const r = imgData.data[pixelIndex];
            const g = imgData.data[pixelIndex + 1];
            const b = imgData.data[pixelIndex + 2];
            const a = imgData.data[pixelIndex + 3];

            const { x: curvedX, y: curvedY } = mapToCurve(x, y, img.width, img.height);

            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
            ctx.fillRect(curvedX, curvedY, 1, 1);
        }
    }

    return canvas;
}

module.exports = { stretchImageAlongCurve };
