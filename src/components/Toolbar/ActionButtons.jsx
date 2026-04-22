import './ActionButtons.css'

export default function ActionButtons({
  canUndo, canRedo,
  onUndo, onRedo, onClear,
  onSave,
  onOpenFigures,
}) {
  return (
    <div className="action-buttons">
      <div className="action-group">
        <button className="action-btn" onClick={onUndo} disabled={!canUndo} title="Deshacer">
          ↩️
        </button>
        <button className="action-btn" onClick={onRedo} disabled={!canRedo} title="Rehacer">
          ↪️
        </button>
        <button className="action-btn danger" onClick={onClear} title="Limpiar todo">
          🗑️
        </button>
      </div>
      <div className="action-group">
        <button className="action-btn success" onClick={onSave} title="Guardar imagen">
          💾
        </button>
        <button className="action-btn primary" onClick={onOpenFigures} title="Elegir figura">
          🖼️
        </button>
      </div>
    </div>
  )
}
