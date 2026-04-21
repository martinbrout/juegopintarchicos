import { useEffect, forwardRef } from 'react'

const CANVAS_W = 1200
const CANVAS_H = 900

const ReferenceCanvas = forwardRef(function ReferenceCanvas({ figureSrc, customOutlineImageData }, ref) {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    const ctx = canvas.getContext('2d')

    // Fill white (open areas where fill is allowed)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    if (customOutlineImageData) {
      ctx.putImageData(customOutlineImageData, 0, 0)
      return
    }

    if (!figureSrc) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)

      // Binarize to pure B&W so JPEG compression artifacts don't create boundary gaps
      const isSvg = figureSrc.toLowerCase().split('?')[0].endsWith('.svg')
      if (!isSvg) {
        const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
        const d = imgData.data
        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
          const bw = gray < 180 ? 0 : 255
          d[i] = d[i + 1] = d[i + 2] = bw
          d[i + 3] = 255
        }
        ctx.putImageData(imgData, 0, 0)
      }
    }
    img.src = figureSrc
  }, [figureSrc, customOutlineImageData])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      }}
    />
  )
})

export default ReferenceCanvas
