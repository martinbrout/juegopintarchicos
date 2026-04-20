const GX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
const GY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]

function gaussianBlur(data, w, h) {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1]
  const out = new Uint8ClampedArray(data.length)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0
      let k = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const i = ((y + ky) * w + (x + kx)) * 4
          sum += data[i] * kernel[k++]
        }
      }
      const i = (y * w + x) * 4
      out[i] = out[i + 1] = out[i + 2] = sum / 16
      out[i + 3] = 255
    }
  }
  return out
}

export function imageToOutline(imgElement, threshold = 40) {
  const MAX_W = 1200
  const MAX_H = 900

  let sw = imgElement.naturalWidth
  let sh = imgElement.naturalHeight
  const ratio = Math.min(MAX_W / sw, MAX_H / sh, 1)
  sw = Math.round(sw * ratio)
  sh = Math.round(sh * ratio)

  const offscreen = document.createElement('canvas')
  offscreen.width = sw
  offscreen.height = sh
  const ctx = offscreen.getContext('2d')
  ctx.drawImage(imgElement, 0, 0, sw, sh)

  const imgData = ctx.getImageData(0, 0, sw, sh)
  const pixels = imgData.data

  // To grayscale
  const gray = new Uint8ClampedArray(sw * sh)
  for (let i = 0; i < gray.length; i++) {
    const p = i * 4
    gray[i] = Math.round(0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2])
  }

  // Build fake RGBA for gaussian (use gray in R channel)
  const grayRgba = new Uint8ClampedArray(sw * sh * 4)
  for (let i = 0; i < gray.length; i++) {
    grayRgba[i * 4] = gray[i]
    grayRgba[i * 4 + 3] = 255
  }

  const blurred = gaussianBlur(grayRgba, sw, sh)

  // Sobel
  const result = new Uint8ClampedArray(sw * sh * 4)
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      let gx = 0
      let gy = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const val = blurred[((y + ky) * sw + (x + kx)) * 4]
          gx += val * GX[ky + 1][kx + 1]
          gy += val * GY[ky + 1][kx + 1]
        }
      }
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy))
      const i = (y * sw + x) * 4
      if (mag > threshold) {
        result[i] = 0
        result[i + 1] = 0
        result[i + 2] = 0
        result[i + 3] = 255
      } else {
        result[i + 3] = 0
      }
    }
  }

  const outData = new ImageData(result, sw, sh)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = sw
  outCanvas.height = sh
  outCanvas.getContext('2d').putImageData(outData, 0, 0)

  return { canvas: outCanvas, width: sw, height: sh }
}
