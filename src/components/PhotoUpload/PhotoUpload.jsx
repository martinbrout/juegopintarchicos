import { useState, useRef, useEffect } from 'react'
import './PhotoUpload.css'

function binarize(imgEl, threshold) {
  const W = 800, H = 600
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const ctx = off.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.drawImage(imgEl, 0, 0, W, H)
  const imgData = ctx.getImageData(0, 0, W, H)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
    const bw = gray < threshold ? 0 : 255
    d[i] = d[i + 1] = d[i + 2] = bw
    d[i + 3] = 255
  }
  ctx.putImageData(imgData, 0, 0)
  return off.toDataURL('image/png')
}

export default function PhotoUpload({ onConfirm, onClose }) {
  const [preview, setPreview] = useState(null)
  const [processedUrl, setProcessedUrl] = useState(null)
  const [threshold, setThreshold] = useState(180)
  const [figureName, setFigureName] = useState('')
  const [imgReady, setImgReady] = useState(false)
  const imgRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (imgReady && imgRef.current) {
      setProcessedUrl(binarize(imgRef.current, threshold))
    }
  }, [threshold, imgReady])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setImgReady(false)
    setProcessedUrl(null)
    setFigureName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }

  function handleImageLoad() {
    setImgReady(true)
    setProcessedUrl(binarize(imgRef.current, threshold))
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
                {processedUrl && (
                  <div className="photo-preview-box">
                    <span className="photo-preview-label">Para colorear</span>
                    <img src={processedUrl} alt="processed" className="photo-preview-img outline-preview" />
                  </div>
                )}
              </div>

              <div className="photo-controls">
                <label className="threshold-label">
                  Grosor del contorno:
                  <input
                    type="range" min="80" max="240" value={threshold}
                    onChange={e => setThreshold(Number(e.target.value))}
                    className="threshold-slider"
                  />
                  <span className="threshold-hint">💡 Cuanto más grueso el contorno, más fácil es pintar</span>
                </label>

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
                    disabled={!processedUrl || !figureName.trim()}
                  >
                    💾 Guardar y usar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
