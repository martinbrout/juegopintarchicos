export async function exportAsPng(drawingCanvas, stickerList, overlayUrl, bgColor = '#ffffff') {
  const w = drawingCanvas.width
  const h = drawingCanvas.height

  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')

  // Background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)

  // Drawing layer
  ctx.drawImage(drawingCanvas, 0, 0)

  // Stickers
  for (const s of stickerList) {
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const size = s.scale * 80
        ctx.drawImage(img, s.x - size / 2, s.y - size / 2, size, size)
        resolve()
      }
      img.onerror = resolve
      img.src = s.src
    })
  }

  // SVG outline on top
  if (overlayUrl) {
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h)
        resolve()
      }
      img.onerror = resolve
      img.src = overlayUrl
    })
  }

  return out.toDataURL('image/png')
}

export function downloadPng(dataUrl, filename = 'mi-dibujo.png') {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function printDrawing(dataUrl) {
  const win = window.open('', '_blank')
  win.document.write(`
    <html><head><title>Mi dibujo</title>
    <style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;}
    img{max-width:100%;max-height:100vh;}</style></head>
    <body><img src="${dataUrl}" onload="window.print();window.close()"/></body></html>
  `)
  win.document.close()
}
