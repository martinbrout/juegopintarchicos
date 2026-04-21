import { useRef, useEffect } from 'react'
import SvgOverlay from './SvgOverlay'
import ReferenceCanvas from './ReferenceCanvas'
import StickerLayer from './StickerLayer'
import { TOOLS } from '../../constants/tools'
import './CanvasStage.css'

const CANVAS_W = 1200
const CANVAS_H = 900

function isSvgUrl(url) {
  return !url || url.toLowerCase().split('?')[0].endsWith('.svg')
}

export default function CanvasStage({
  activeTool,
  activeBrush,
  activeColor,
  activeFigure,
  customOutline,
  customOverlayUrl,
  figureInitKey,
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

  // Set canvas dimensions on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width !== CANVAS_W) canvas.width = CANVAS_W
    if (canvas.height !== CANVAS_H) canvas.height = CANVAS_H
  }, [])

  // Bake non-SVG coloring pages into the drawing canvas so bucket fill
  // works against real pixels (white areas) instead of uniform transparency.
  // Photo uploads (customOverlayUrl) keep the z-1 background approach.
  useEffect(() => {
    if (customOverlayUrl) return
    const src = activeFigure?.src
    if (!src || isSvgUrl(src)) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
    }
    img.src = src
  }, [activeFigure?.src, customOverlayUrl, figureInitKey])

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

  // Determine overlay strategy:
  // - SVG figure → overlay on top (z=20), transparent areas drawn on canvas
  // - Non-SVG figure → image baked into canvas, no overlay layer
  // - Photo upload (customOverlayUrl) → background at z=1, draw over photo
  const figSrc = activeFigure?.src ?? null
  const isNonSvgFigure = figSrc && !isSvgUrl(figSrc) && !customOverlayUrl
  const svgOverlaySrc = customOverlayUrl
    ? null
    : (isSvgUrl(figSrc) ? figSrc : null)
  const bgOverlaySrc = customOverlayUrl ?? null

  return (
    <div className="canvas-stage-wrapper">
      <div className="canvas-stage">
        <ReferenceCanvas
          ref={referenceCanvasRef}
          figureSrc={activeFigure?.refSrc ?? activeFigure?.src}
          customOutlineImageData={customOutline}
        />

        {/* Photo upload: show photo as background behind drawing canvas */}
        {bgOverlaySrc && <SvgOverlay src={bgOverlaySrc} isBackground />}

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

        {/* SVG figure: outline overlay on top so lines are always crisp */}
        {svgOverlaySrc && <SvgOverlay src={svgOverlaySrc} />}

        <StickerLayer
          stickers={stickers}
          onUpdateSticker={onUpdateSticker}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  )
}
