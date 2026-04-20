import { STICKERS } from '../../constants/figures'
import './StickerPanel.css'

export default function StickerPanel({ onClose, onSelectSticker }) {
  return (
    <div className="sticker-overlay" onClick={onClose}>
      <div className="sticker-modal" onClick={e => e.stopPropagation()}>
        <div className="sticker-header">
          <h2 className="sticker-title">¡Elegí un sticker! ⭐</h2>
          <button className="sticker-close" onClick={onClose}>✕</button>
        </div>
        <p className="sticker-hint">Tocá uno y después tocá donde querés ponerlo en el dibujo</p>
        <div className="sticker-grid">
          {STICKERS.map(s => (
            <button
              key={s.id}
              className="sticker-item"
              onClick={() => { onSelectSticker(s); onClose() }}
              title={s.name}
            >
              <img src={s.src} alt={s.name} className="sticker-img" draggable={false} />
              <span className="sticker-name">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
