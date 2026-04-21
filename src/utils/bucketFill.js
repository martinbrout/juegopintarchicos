function hexToRgba(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    255,
  ]
}

// A pixel is an outline boundary if it's noticeably non-white.
// Threshold 200 catches anti-aliased SVG edges (gray ~180-220) that R+G+B<150 misses.
function isBoundary(refPixels, i4) {
  return refPixels[i4] < 200 || refPixels[i4 + 1] < 200 || refPixels[i4 + 2] < 200
}

export function bucketFill(drawingCanvas, referenceCanvas, startX, startY, fillColor) {
  const w = drawingCanvas.width
  const h = drawingCanvas.height
  const drawCtx = drawingCanvas.getContext('2d')
  const refCtx = referenceCanvas.getContext('2d')

  const drawData = drawCtx.getImageData(0, 0, w, h)
  const refData  = refCtx.getImageData(0, 0, w, h)
  const drawPixels = drawData.data
  const refPixels  = refData.data

  const sx = Math.round(startX)
  const sy = Math.round(startY)
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return

  // Don't fill if clicking directly on an outline pixel
  const refStart = (sy * w + sx) * 4
  if (isBoundary(refPixels, refStart)) return

  const [fr, fg, fb, fa] = hexToRgba(fillColor)

  const startI = (sy * w + sx) * 4
  const tr = drawPixels[startI]
  const tg = drawPixels[startI + 1]
  const tb = drawPixels[startI + 2]
  const ta = drawPixels[startI + 3]

  // Already filled with the same color
  if (tr === fr && tg === fg && tb === fb && ta === fa) return

  const visited = new Uint8Array(w * h)
  const queue   = [sy * w + sx]
  let head = 0

  while (head < queue.length) {
    const idx = queue[head++]
    if (visited[idx]) continue
    visited[idx] = 1

    const i4 = idx * 4

    // Must be within tolerance of the starting color (handles JPEG compression noise)
    const dist = Math.abs(drawPixels[i4]     - tr)
               + Math.abs(drawPixels[i4 + 1] - tg)
               + Math.abs(drawPixels[i4 + 2] - tb)
               + Math.abs(drawPixels[i4 + 3] - ta)
    if (dist > 40) continue

    // Stop at outline boundary in reference canvas
    if (isBoundary(refPixels, i4)) continue

    // Paint
    drawPixels[i4]     = fr
    drawPixels[i4 + 1] = fg
    drawPixels[i4 + 2] = fb
    drawPixels[i4 + 3] = fa

    const px = idx % w
    const py = (idx - px) / w

    if (px > 0)     queue.push(idx - 1)
    if (px < w - 1) queue.push(idx + 1)
    if (py > 0)     queue.push(idx - w)
    if (py < h - 1) queue.push(idx + w)
  }

  drawCtx.putImageData(drawData, 0, 0)
}
