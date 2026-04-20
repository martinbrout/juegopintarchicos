import { useState, useRef } from 'react'

export default function StickerLayer({ stickers, onUpdateSticker, canvasRef }) {
  const dragging = useRef(null)

  function getScaledCoords(e) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function handlePointerDown(e, id) {
    e.stopPropagation()
    dragging.current = { id, startX: e.clientX, startY: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    if (!dragging.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    onUpdateSticker(dragging.current.id, { x, y })
  }

  function handlePointerUp() {
    dragging.current = null
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 30,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {stickers.map(s => {
        const canvas = canvasRef.current
        const rect = canvas?.getBoundingClientRect() ?? { width: 1, height: 1 }
        const scaleX = rect.width / (canvas?.width ?? 1200)
        const scaleY = rect.height / (canvas?.height ?? 900)
        const size = s.scale * 80
        const displayX = s.x * scaleX - (size * scaleX) / 2
        const displayY = s.y * scaleY - (size * scaleY) / 2
        const displaySize = size * Math.min(scaleX, scaleY)

        return (
          <img
            key={s.id}
            src={s.src}
            alt=""
            draggable={false}
            onPointerDown={e => handlePointerDown(e, s.id)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              position: 'absolute',
              left: displayX,
              top: displayY,
              width: displaySize,
              height: displaySize,
              pointerEvents: 'all',
              cursor: 'grab',
              userSelect: 'none',
              touchAction: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        )
      })}
    </div>
  )
}
