import { BRUSHES, BRUSH_LABELS, BRUSH_ICONS } from '../../constants/brushes'
import './ToolButton.css'

const BRUSH_LIST = [BRUSHES.PENCIL, BRUSHES.MARKER, BRUSHES.CRAYON, BRUSHES.ERASER]

export default function BrushSelector({ activeBrush, onChange, onSwitchToDraw }) {
  function handleClick(brush) {
    onChange(brush)
    onSwitchToDraw?.()
  }

  return (
    <div className="tool-group">
      <span className="tool-group-label">Herramienta</span>
      <div className="tool-buttons">
        {BRUSH_LIST.map(brush => (
          <button
            key={brush}
            className={`tool-btn ${activeBrush === brush ? 'active' : ''}`}
            onClick={() => handleClick(brush)}
            title={BRUSH_LABELS[brush]}
          >
            <span className="tool-icon">{BRUSH_ICONS[brush]}</span>
            <span className="tool-label">{BRUSH_LABELS[brush]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
