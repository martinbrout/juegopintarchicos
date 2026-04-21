import { FIGURES } from '../../constants/figures'
import './FigureGallery.css'

export default function FigureGallery({ activeFigureId, onSelect, onClose, onUploadPhoto, customFigures = [] }) {
  const allFigures = [...FIGURES, ...customFigures]

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={e => e.stopPropagation()}>
        <div className="gallery-header">
          <h2 className="gallery-title">¡Elegí tu figura! 🎨</h2>
          <button className="gallery-close" onClick={onClose}>✕</button>
        </div>
        <div className="gallery-grid">
          {allFigures.map(fig => (
            <button
              key={fig.id}
              className={`gallery-item ${activeFigureId === fig.id ? 'active' : ''}`}
              onClick={() => { onSelect(fig); onClose() }}
            >
              {fig.src
                ? <img src={fig.src} alt={fig.name} className="gallery-thumb" draggable={false} />
                : <span className="gallery-emoji">{fig.emoji}</span>
              }
              <span className="gallery-name">{fig.name}</span>
            </button>
          ))}

          <button
            className="gallery-item gallery-item-photo"
            onClick={() => { onClose(); onUploadPhoto() }}
          >
            <span className="gallery-emoji">📷</span>
            <span className="gallery-name">+ Agregar foto</span>
          </button>
        </div>
      </div>
    </div>
  )
}
