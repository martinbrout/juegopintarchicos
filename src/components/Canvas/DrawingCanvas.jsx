import { useEffect } from 'react'
import { TOOLS } from '../../constants/tools'
import { bucketFill } from '../../utils/bucketFill'

const CANVAS_W = 1200
const CANVAS_H = 900

export default function DrawingCanvas({
  canvasRef,
  referenceCanvasRef,
  activeTool,
  activeBrush,
  activeColor,
  stickers,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onStickerPlace,
}) {

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
  }, [])

  function handlePointerDown(e) {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)

    if (activeTool === TOOLS.FILL) {
      const canvas = canvasRef.current
      const ref = referenceCanvasRef.current
      if (!canvas || !ref) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY
      bucketFill(canvas, ref, x, y, activeColor)
      return
    }

    if (activeTool === TOOLS.STICKER) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      onStickerPlace?.({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      })
      return
    }

    if (activeTool === TOOLS.DRAW) {
      onPointerDown(e)
    }
  }

  function handlePointerMove(e) {
    if (activeTool !== TOOLS.DRAW) return
    onPointerMove(e)
  }

  function handlePointerUp(e) {
    if (activeTool !== TOOLS.DRAW) return
    onPointerUp(e)
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        touchAction: 'none',
        cursor: activeTool === TOOLS.FILL ? 'crosshair' : 'crosshair',
      }}
    />
  )
}
