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
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
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
