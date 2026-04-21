import { useState, useRef } from 'react'
import './PhotoUpload.css'

export default function PhotoUpload({ onConfirm, onClose }) {
  const [preview, setPreview] = useState(null)
  const imgRef = useRef(null)
  const inputRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  function handleConfirm() {
    if (!imgRef.current) return
    const offscreen = document.createElement('canvas')
    offscreen.width = 1200
    offscreen.height = 900
    const ctx = offscreen.getContext('2d')
    ctx.drawImage(imgRef.current, 0, 0, 1200, 900)
    const imageData = ctx.getImageData(0, 0, 1200, 900)
    onConfirm({ imageData, dataUrl: offscreen.toDataURL() })
    onClose()
  }

  return (
    <div className="photo-overlay" onClick={onClose}>
      <div className="photo-modal" onClick={e => e.stopPropagation()}>
        <div className="photo-header">
          <h2 className="photo-title">📷 Subir foto</h2>
          <button className="photo-close" onClick={onClose}>✕</button>
        </div>
        <p className="photo-hint">Elegí una foto para usar como lienzo</p>

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
                  <img
                    ref={imgRef}
                    src={preview}
                    alt="preview"
                    className="photo-preview-img"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
              <div className="photo-actions">
                <button className="photo-btn secondary" onClick={() => inputRef.current?.click()}>
                  Otra foto
                </button>
                <button className="photo-btn success" onClick={handleConfirm}>
                  ✅ Usar esta foto
                </button>
              </div>
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
