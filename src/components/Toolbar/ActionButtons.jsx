import './ActionButtons.css'

export default function ActionButtons({
  canUndo, canRedo,
  onUndo, onRedo, onClear,
  onSave, onPrint,
  isMusicOn, onToggleMusic,
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
        <button className="action-btn" onClick={onPrint} title="Imprimir">
          🖨️
        </button>
      </div>
      <div className="action-group">
        <button className="action-btn primary" onClick={onOpenFigures} title="Elegir figura">
          🖼️
        </button>
        <button className="action-btn" onClick={onToggleMusic} title={isMusicOn ? 'Silenciar' : 'Activar música'}>
          {isMusicOn ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  )
}
