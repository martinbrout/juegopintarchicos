import { useState, useRef, useEffect } from 'react'
import './PhotoUpload.css'

const W = 800, H = 600

// ── Local edge-detection pipeline ──────────────────────────────────────────

function gaussBlur5(src) {
  const K = [1,4,7,4,1, 4,16,26,16,4, 7,26,41,26,7, 4,16,26,16,4, 1,4,7,4,1]
  const out = new Float32Array(src.length)
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      let s = 0
      for (let ky = -2; ky <= 2; ky++)
        for (let kx = -2; kx <= 2; kx++)
          s += src[(y + ky) * W + (x + kx)] * K[(ky + 2) * 5 + (kx + 2)]
      out[y * W + x] = s / 273
    }
  }
  return out
}

function processLocal(imgEl, threshold) {
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const ctx = off.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.drawImage(imgEl, 0, 0, W, H)
  const { data: d } = ctx.getImageData(0, 0, W, H)

  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++)
    gray[i] = d[i*4] * 0.299 + d[i*4+1] * 0.587 + d[i*4+2] * 0.114

  const blurred = gaussBlur5(gaussBlur5(gray))

  const mag = new Float32Array(W * H)
  let maxMag = 0
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const gx = -blurred[(y-1)*W+(x-1)] + blurred[(y-1)*W+(x+1)]
               - 2*blurred[y*W+(x-1)]   + 2*blurred[y*W+(x+1)]
               - blurred[(y+1)*W+(x-1)] + blurred[(y+1)*W+(x+1)]
      const gy =  blurred[(y+1)*W+(x-1)] + 2*blurred[(y+1)*W+x] + blurred[(y+1)*W+(x+1)]
               - blurred[(y-1)*W+(x-1)] - 2*blurred[(y-1)*W+x] - blurred[(y-1)*W+(x+1)]
      const m = Math.abs(gx) + Math.abs(gy)
      mag[y * W + x] = m
      if (m > maxMag) maxMag = m
    }
  }

  const sensitivity = 0.30 - 0.27 * (threshold - 80) / 160
  const edgeThresh = maxMag * sensitivity
  const edges = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) edges[i] = mag[i] > edgeThresh ? 1 : 0

  const out = ctx.createImageData(W, H)
  const od = out.data
  for (let i = 0; i < od.length; i += 4) { od[i] = od[i+1] = od[i+2] = od[i+3] = 255 }
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const isEdge =
        edges[(y-1)*W+(x-1)] | edges[(y-1)*W+x] | edges[(y-1)*W+(x+1)] |
        edges[y*W+(x-1)]     | edges[y*W+x]     | edges[y*W+(x+1)]     |
        edges[(y+1)*W+(x-1)] | edges[(y+1)*W+x] | edges[(y+1)*W+(x+1)]
      const v = isEdge ? 0 : 255
      const i4 = (y * W + x) * 4
      od[i4] = od[i4+1] = od[i4+2] = v
    }
  }
  ctx.putImageData(out, 0, 0)
  return off.toDataURL('image/png')
}

// ── AI transform via serverless function ───────────────────────────────────

function resizeToBase64(imgEl, maxSize = 512) {
  const scale = Math.min(maxSize / imgEl.naturalWidth, maxSize / imgEl.naturalHeight, 1)
  const w = Math.round(imgEl.naturalWidth * scale)
  const h = Math.round(imgEl.naturalHeight * scale)
  const off = document.createElement('canvas')
  off.width = w; off.height = h
  off.getContext('2d').drawImage(imgEl, 0, 0, w, h)
  // remove the "data:image/jpeg;base64," prefix
  return off.toDataURL('image/jpeg', 0.8).split(',')[1]
}

async function processAI(imgEl) {
  const imageBase64 = resizeToBase64(imgEl)
  const res = await fetch('/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error del servidor')
  return `data:image/png;base64,${data.imageBase64}`
}

// ── Component ───────────────────────────────────────────────────────────────

export default function PhotoUpload({ onConfirm, onClose }) {
  const [preview, setPreview] = useState(null)
  const [imgReady, setImgReady] = useState(false)
  const [mode, setMode] = useState(null)          // null | 'ai' | 'local'
  const [processedUrl, setProcessedUrl] = useState(null)
  const [threshold, setThreshold] = useState(180)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [figureName, setFigureName] = useState('')
  const imgRef = useRef(null)
  const inputRef = useRef(null)

  // re-run local processing when threshold changes
  useEffect(() => {
    if (mode === 'local' && imgReady && imgRef.current)
      setProcessedUrl(processLocal(imgRef.current, threshold))
  }, [threshold, mode, imgReady])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setImgReady(false)
    setProcessedUrl(null)
    setMode(null)
    setAiError(null)
    setFigureName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  function handleImageLoad() {
    setImgReady(true)
  }

  async function handleModeSelect(selected) {
    setMode(selected)
    setProcessedUrl(null)
    setAiError(null)
    if (selected === 'local') {
      setProcessedUrl(processLocal(imgRef.current, threshold))
    } else {
      setAiLoading(true)
      try {
        const url = await processAI(imgRef.current)
        setProcessedUrl(url)
      } catch (err) {
        setAiError(err.message)
      } finally {
        setAiLoading(false)
      }
    }
  }

  function handleConfirm() {
    if (!processedUrl || !figureName.trim()) return
    onConfirm({ name: figureName.trim(), processedDataUrl: processedUrl })
    onClose()
  }

  return (
    <div className="photo-overlay" onClick={onClose}>
      <div className="photo-modal" onClick={e => e.stopPropagation()}>
        <div className="photo-header">
          <h2 className="photo-title">📷 Agregar foto</h2>
          <button className="photo-close" onClick={onClose}>✕</button>
        </div>
        <p className="photo-hint">La foto se convierte en un dibujo para colorear y queda guardada en la galería</p>

        <div className="photo-body">
          {!preview ? (
            <button className="photo-upload-btn" onClick={() => inputRef.current?.click()}>
              <span className="photo-upload-icon">📁</span>
              <span>Elegir foto</span>
            </button>
          ) : (
            <>
              <div className="photo-previews">
                <div className="photo-preview-box">
                  <span className="photo-preview-label">Original</span>
                  <img
                    ref={imgRef}
                    src={preview}
                    alt="original"
                    className="photo-preview-img"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                  />
                </div>
                {(processedUrl || aiLoading) && (
                  <div className="photo-preview-box">
                    <span className="photo-preview-label">Para colorear</span>
                    {aiLoading
                      ? <div className="photo-ai-loading">🤖<br/>Generando con IA…</div>
                      : <img src={processedUrl} alt="processed" className="photo-preview-img outline-preview" />
                    }
                  </div>
                )}
              </div>

              {/* Mode selection */}
              {imgReady && !aiLoading && (
                <div className="photo-mode-selector">
                  <button
                    className={`photo-mode-btn ${mode === 'ai' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('ai')}
                  >
                    🤖 Transformar con IA
                    <span className="photo-mode-sub">Mejor resultado</span>
                  </button>
                  <button
                    className={`photo-mode-btn ${mode === 'local' ? 'active' : ''}`}
                    onClick={() => handleModeSelect('local')}
                  >
                    ✏️ Contorno automático
                    <span className="photo-mode-sub">Sin internet</span>
                  </button>
                </div>
              )}

              {aiError && (
                <p className="photo-ai-error">⚠️ {aiError}</p>
              )}

              {/* Local threshold slider */}
              {mode === 'local' && (
                <label className="threshold-label" style={{ marginTop: 8 }}>
                  Grosor del contorno:
                  <input
                    type="range" min="80" max="240" value={threshold}
                    onChange={e => setThreshold(Number(e.target.value))}
                    className="threshold-slider"
                  />
                  <span className="threshold-hint">💡 Cuanto más grueso el contorno, más fácil es pintar</span>
                </label>
              )}

              {/* Name + actions */}
              {processedUrl && (
                <div className="photo-controls" style={{ marginTop: 8 }}>
                  <label className="threshold-label">
                    Nombre para la galería:
                    <input
                      type="text"
                      className="figure-name-input"
                      placeholder="Ej: Mi dibujo de Bluey"
                      value={figureName}
                      onChange={e => setFigureName(e.target.value)}
                      maxLength={30}
                    />
                  </label>
                  <div className="photo-actions">
                    <button className="photo-btn secondary" onClick={() => inputRef.current?.click()}>
                      Otra foto
                    </button>
                    <button
                      className="photo-btn success"
                      onClick={handleConfirm}
                      disabled={!figureName.trim()}
                    >
                      💾 Guardar y usar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
