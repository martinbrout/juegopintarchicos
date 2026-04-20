import { useRef, useEffect } from 'react'
import SvgOverlay from './SvgOverlay'
import ReferenceCanvas from './ReferenceCanvas'
import StickerLayer from './StickerLayer'
import { TOOLS } from '../../constants/tools'
import './CanvasStage.css'

const CANVAS_W = 1200
const CANVAS_H = 900

export default function CanvasStage({
  activeTool,
  activeBrush,
  activeColor,
  activeFigure,
  customOutline,
  customOverlayUrl,
  stickers,
  onAddSticker,
  onUpdateSticker,
  onPlaySfx,
  canvasRef,
  referenceCanvasRef: externalRefCanvasRef,
  startStroke,
  continueStroke,
  endStroke,
  onBucketFill,
  pendingSticker,
}) {
  const internalRefCanvasRef = useRef(null)
  const referenceCanvasRef = externalRefCanvasRef ?? internalRefCanvasRef

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width !== CANVAS_W) canvas.width = CANVAS_W
    if (canvas.height !== CANVAS_H) canvas.height = CANVAS_H
  }, [])

  function getScaled(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  function handlePointerDown(e) {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)

    if (activeTool === TOOLS.FILL) {
      const canvas = canvasRef.current
      const ref = referenceCanvasRef.current
      if (!canvas || !ref) return
      const { x, y } = getScaled(e, canvas)
      onBucketFill?.(canvas, ref, x, y)
      return
    }

    if (activeTool === TOOLS.STICKER) {
      const canvas = canvasRef.current
      if (!canvas) return
      const { x, y } = getScaled(e, canvas)
      onAddSticker?.({ x, y })
      return
    }

    if (activeTool === TOOLS.DRAW) {
      onPlaySfx?.('pincel', activeBrush)
      startStroke(e, activeBrush, activeColor)
    }
  }

  function handlePointerMove(e) {
    if (activeTool !== TOOLS.DRAW) return
    continueStroke(e, activeBrush, activeColor)
  }

  function handlePointerUp(e) {
    if (activeTool !== TOOLS.DRAW) return
    endStroke(e)
  }

  const overlayUrl = customOverlayUrl ?? activeFigure?.src ?? null

  return (
    <div className="canvas-stage-wrapper">
      <div className="canvas-stage">
        <ReferenceCanvas
          ref={referenceCanvasRef}
          figureSrc={activeFigure?.refSrc ?? activeFigure?.src}
          customOutlineImageData={customOutline}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 10, touchAction: 'none',
            cursor: activeTool === TOOLS.FILL ? 'cell' : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        <SvgOverlay src={overlayUrl} />

        <StickerLayer
          stickers={stickers}
          onUpdateSticker={onUpdateSticker}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  )
}
