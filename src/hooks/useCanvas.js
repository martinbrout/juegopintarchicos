import { useRef, useCallback } from 'react'
import { BRUSHES, BRUSH_SIZES } from '../constants/brushes'

export function useCanvas() {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef(null)

  function getCtx() {
    return canvasRef.current?.getContext('2d') ?? null
  }

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

  function applyBrushStyle(ctx, brush, color) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (brush === BRUSHES.ERASER) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = BRUSH_SIZES[BRUSHES.ERASER]
      ctx.globalAlpha = 1
      ctx.strokeStyle = '#ffffff'
      return
    }

    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = color

    if (brush === BRUSHES.PENCIL) {
      ctx.lineWidth = BRUSH_SIZES[BRUSHES.PENCIL]
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    } else if (brush === BRUSHES.MARKER) {
      ctx.lineWidth = BRUSH_SIZES[BRUSHES.MARKER]
      ctx.globalAlpha = 0.65
      ctx.lineCap = 'square'
      ctx.shadowBlur = 0
    } else if (brush === BRUSHES.CRAYON) {
      ctx.lineWidth = BRUSH_SIZES[BRUSHES.CRAYON]
      ctx.globalAlpha = 0.85
      ctx.shadowBlur = 0
    } else if (brush === BRUSHES.WATERCOLOR) {
      ctx.lineWidth = BRUSH_SIZES[BRUSHES.WATERCOLOR]
      ctx.globalAlpha = 0.07
      ctx.lineCap = 'round'
      ctx.shadowBlur = 14
      ctx.shadowColor = color
    }
  }

  function drawCrayonScatter(ctx, x, y, color, size) {
    const prev = ctx.globalCompositeOperation
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = color
    const jitter = size * 0.7
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = 0.2 + Math.random() * 0.5
      const w = size * (0.3 + Math.random() * 0.6)
      const h = size * (0.3 + Math.random() * 0.6)
      ctx.fillRect(
        x + (Math.random() - 0.5) * jitter,
        y + (Math.random() - 0.5) * jitter,
        w, h
      )
    }
    ctx.globalCompositeOperation = prev
  }

  const startStroke = useCallback((e, brush, color, onFirstStroke) => {
    const ctx = getCtx()
    if (!ctx) return
    const pt = getScaledCoords(e)
    isDrawing.current = true
    lastPoint.current = pt

    onFirstStroke?.()

    ctx.save()
    applyBrushStyle(ctx, brush, color)
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fillStyle = brush === BRUSHES.ERASER ? '#ffffff' : color
    ctx.fill()
    ctx.restore()

    if (brush === BRUSHES.CRAYON) {
      const ctx2 = getCtx()
      ctx2.save()
      drawCrayonScatter(ctx2, pt.x, pt.y, color, BRUSH_SIZES[BRUSHES.CRAYON])
      ctx2.restore()
    }
  }, [])

  const continueStroke = useCallback((e, brush, color) => {
    if (!isDrawing.current) return
    const ctx = getCtx()
    if (!ctx) return
    const pt = getScaledCoords(e)
    const last = lastPoint.current

    ctx.save()
    applyBrushStyle(ctx, brush, color)
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    ctx.restore()

    if (brush === BRUSHES.CRAYON) {
      const ctx2 = getCtx()
      ctx2.save()
      drawCrayonScatter(ctx2, pt.x, pt.y, color, BRUSH_SIZES[BRUSHES.CRAYON])
      ctx2.restore()
    }

    lastPoint.current = pt
  }, [])

  const endStroke = useCallback(() => {
    isDrawing.current = false
    lastPoint.current = null
  }, [])

  const clearCanvas = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }, [])

  const getSnapshot = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return null
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  }, [])

  const restoreSnapshot = useCallback((imageData) => {
    const ctx = getCtx()
    if (!ctx || !imageData) return
    ctx.putImageData(imageData, 0, 0)
  }, [])

  return {
    canvasRef,
    startStroke,
    continueStroke,
    endStroke,
    clearCanvas,
    getSnapshot,
    restoreSnapshot,
    isDrawing,
  }
}
