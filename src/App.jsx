import { useState, useRef } from 'react'
import { bucketFill } from './utils/bucketFill'
import CanvasStage from './components/Canvas/CanvasStage'
import Toolbar from './components/Toolbar/Toolbar'
import FigureGallery from './components/Figures/FigureGallery'
import StickerPanel from './components/Stickers/StickerPanel'
import PhotoUpload from './components/PhotoUpload/PhotoUpload'
import { useCanvas } from './hooks/useCanvas'
import { useHistory } from './hooks/useHistory'
import { useAudio } from './hooks/useAudio'
import { DEFAULT_COLOR } from './constants/colors'
import { DEFAULT_BRUSH } from './constants/brushes'
import { DEFAULT_TOOL, TOOLS } from './constants/tools'
import { FIGURES } from './constants/figures'
import { exportAsPng, downloadPng } from './utils/canvasExport'
import './App.css'

const STORAGE_KEY = 'jpp_custom_figures'

function loadCustomFigures() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

let stickerIdCounter = 0

export default function App() {
  const [activeColor, setActiveColor] = useState(DEFAULT_COLOR)
  const [activeBrush, setActiveBrush] = useState(DEFAULT_BRUSH)
  const [activeTool, setActiveTool] = useState(DEFAULT_TOOL)
  const [activeFigure, setActiveFigure] = useState(FIGURES[1])
  const [customFigures, setCustomFigures] = useState(loadCustomFigures)
  const [stickers, setStickers] = useState([])
  const [pendingSticker, setPendingSticker] = useState(null)

  const [showGallery, setShowGallery] = useState(false)
  const [showStickerPanel, setShowStickerPanel] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [figureInitKey, setFigureInitKey] = useState(0)

  const referenceCanvasRef = useRef(null)

  const {
    canvasRef,
    startStroke,
    continueStroke,
    endStroke,
    clearCanvas,
    getSnapshot,
    restoreSnapshot,
  } = useCanvas()

  const { pushSnapshot, undo, redo, clear: clearHistory, canUndo, canRedo } = useHistory()
  const { playSfx, toggleMusic, isMusicOn } = useAudio()

  function saveSnapshot() {
    const snap = getSnapshot()
    if (snap) pushSnapshot(snap)
  }

  function handleUndo() {
    const snapshot = undo()
    if (snapshot) restoreSnapshot(snapshot)
    else { clearCanvas(); setFigureInitKey(k => k + 1) }
    playSfx('borrar')
  }

  function handleRedo() {
    const snapshot = redo()
    if (snapshot) restoreSnapshot(snapshot)
    playSfx('borrar')
  }

  function handleClear() {
    saveSnapshot()
    clearCanvas()
    setStickers([])
    setFigureInitKey(k => k + 1)
    playSfx('borrar')
  }

  function getExportOverlay() {
    const src = activeFigure?.src ?? null
    if (!src) return null
    return src.toLowerCase().split('?')[0].endsWith('.svg') ? src : null
  }

  async function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = await exportAsPng(canvas, stickers, getExportOverlay())
    downloadPng(dataUrl)
    playSfx('guardar')
  }

  function handleFigureSelect(fig) {
    clearCanvas()
    setStickers([])
    setActiveFigure(fig)
    clearHistory()
    setActiveTool(TOOLS.DRAW)
    playSfx('seleccion')
  }

  function handleToolChange(tool) {
    setActiveTool(tool)
    if (tool === TOOLS.STICKER) setShowStickerPanel(true)
  }

  function handleStickerSelect(stickerDef) {
    setPendingSticker(stickerDef)
    setActiveTool(TOOLS.STICKER)
  }

  function handleStickerPlace({ x, y }) {
    if (!pendingSticker) return
    setStickers(prev => [...prev, {
      id: ++stickerIdCounter,
      src: pendingSticker.src,
      x, y,
      scale: 1,
    }])
    playSfx('sticker')
  }

  function handleUpdateSticker(id, updates) {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  function handlePhotoConfirm({ name, processedDataUrl }) {
    const newFig = {
      id: `custom_${Date.now()}`,
      name,
      src: processedDataUrl,
      refSrc: processedDataUrl,
      emoji: '📷',
    }
    const updated = [...customFigures, newFig]
    setCustomFigures(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
    handleFigureSelect(newFig)
  }

  function handleStrokeEnd(e) {
    endStroke(e)
    saveSnapshot()
  }

  function handleBucketFill(canvas, ref, x, y) {
    saveSnapshot()
    bucketFill(canvas, ref, x, y, activeColor)
    saveSnapshot()
    playSfx('relleno')
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">🎨</span>
        <h1 className="app-title">Juego de Pintar</h1>
        <button className="app-header-btn" onClick={() => setShowGallery(true)} title="Elegir figura">
          🖼️ Figuras
        </button>
      </header>

      <div className="app-body">
        <Toolbar
          activeColor={activeColor} onColorChange={setActiveColor}
          activeBrush={activeBrush} onBrushChange={setActiveBrush}
          activeTool={activeTool} onToolChange={handleToolChange}
          canUndo={canUndo} canRedo={canRedo}
          onUndo={handleUndo} onRedo={handleRedo} onClear={handleClear}
          onSave={handleSave}
          isMusicOn={isMusicOn} onToggleMusic={toggleMusic}
          onOpenFigures={() => setShowGallery(true)}
        />

        <CanvasStage
          activeTool={activeTool}
          activeBrush={activeBrush}
          activeColor={activeColor}
          activeFigure={activeFigure}
          figureInitKey={figureInitKey}
          stickers={stickers}
          onAddSticker={handleStickerPlace}
          onUpdateSticker={handleUpdateSticker}
          onPlaySfx={playSfx}
          canvasRef={canvasRef}
          referenceCanvasRef={referenceCanvasRef}
          startStroke={startStroke}
          continueStroke={continueStroke}
          endStroke={handleStrokeEnd}
          onBucketFill={handleBucketFill}
          pendingSticker={pendingSticker}
        />
      </div>

      {showGallery && (
        <FigureGallery
          activeFigureId={activeFigure?.id}
          onSelect={handleFigureSelect}
          onClose={() => setShowGallery(false)}
          onUploadPhoto={() => setShowPhotoUpload(true)}
          customFigures={customFigures}
        />
      )}

      {showStickerPanel && (
        <StickerPanel
          onClose={() => setShowStickerPanel(false)}
          onSelectSticker={handleStickerSelect}
        />
      )}

      {showPhotoUpload && (
        <PhotoUpload
          onConfirm={handlePhotoConfirm}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </div>
  )
}
