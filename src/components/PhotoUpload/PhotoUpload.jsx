import { useState, useRef } from 'react'
import { imageToOutline } from '../../utils/edgeDetection'
import './PhotoUpload.css'

export default function PhotoUpload({ onConfirm, onClose }) {
  const [preview, setPreview] = useState(null)
  const [outlineCanvas, setOutlineCanvas] = useState(null)
  const [threshold, setThreshold] = useState(40)
  const [processing, setProcessing] = useState(false)
  const imgRef = useRef(null)
  const inputRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setOutlineCanvas(null)
  }

  async function handleProcess() {
    if (!imgRef.current) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 50))
    const result = imageToOutline(imgRef.current, threshold)
    setOutlineCanvas(result)
    setProcessing(false)
  }

  function handleThresholdChange(val) {
    setThreshold(val)
    if (outlineCanvas && imgRef.current) {
      const result = imageToOutline(imgRef.current, val)
      setOutlineCanvas(result)
    }
  }

  function handleConfirm() {
    if (!outlineCanvas) return
    const ctx = outlineCanvas.canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, outlineCanvas.canvas.width, outlineCanvas.canvas.height)
    onConfirm({ imageData, dataUrl: outlineCanvas.canvas.toDataURL() })
    onClose()
  }

  return (
    <div className="photo-overlay" onClick={onClose}>
      <div className="photo-modal" onClick={e => e.stopPropagation()}>
        <div className="photo-header">
          <h2 className="photo-title">📷 Subir foto</h2>
          <button className="photo-close" onClick={onClose}>✕</button>
        </div>
        <p className="photo-hint">Subí una foto y la convertimos en un dibujo para colorear</p>

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
                  />
                </div>
                {outlineCanvas && (
                  <div className="photo-preview-box">
                    <span className="photo-preview-label">Contorno</span>
                    <img
                      src={outlineCanvas.canvas.toDataURL()}
                      alt="outline"
                      className="photo-preview-img outline-preview"
                    />
                  </div>
                )}
              </div>

              <div className="photo-controls">
                <label className="threshold-label">
                  Detalle del contorno:
                  <input
                    type="range"
                    min="10" max="120"
                    value={threshold}
                    onChange={e => handleThresholdChange(Number(e.target.value))}
                    className="threshold-slider"
                  />
                </label>

                <div className="photo-actions">
                  <button className="photo-btn secondary" onClick={() => inputRef.current?.click()}>
                    Otra foto
                  </button>
                  {!outlineCanvas
                    ? <button className="photo-btn primary" onClick={handleProcess} disabled={processing}>
                        {processing ? 'Procesando...' : '✨ Convertir'}
                      </button>
                    : <button className="photo-btn success" onClick={handleConfirm}>
                        ✅ Usar este contorno
                      </button>
                  }
                </div>
              </div>
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} />
      </div>
    </div>
  )
}
