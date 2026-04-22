import { useState } from 'react'
import ColorPalette from './ColorPalette'
import ActionButtons from './ActionButtons'
import ToolAndBrushPanel from './ToolAndBrushPanel'
import './Toolbar.css'

export default function Toolbar({
  activeColor, onColorChange,
  activeBrush, onBrushChange,
  activeTool, onToolChange,
  canUndo, canRedo,
  onUndo, onRedo, onClear,
  onSave,
  onOpenFigures,
}) {
  const [mobileTab, setMobileTab] = useState('herramientas')

  return (
    <aside className="toolbar">
      {/* ── Desktop layout ── */}
      <div className="toolbar-scroll toolbar-desktop">
        <ToolAndBrushPanel
          activeTool={activeTool} activeBrush={activeBrush}
          onToolChange={onToolChange} onBrushChange={onBrushChange}
        />
        <div className="toolbar-divider" />
        <ColorPalette activeColor={activeColor} onChange={onColorChange} />
        <div className="toolbar-divider" />
        <ActionButtons
          canUndo={canUndo} canRedo={canRedo}
          onUndo={onUndo} onRedo={onRedo} onClear={onClear}
          onSave={onSave}
          onOpenFigures={onOpenFigures}
        />
      </div>

      {/* ── Mobile layout ── */}
      <div className="toolbar-mobile">
        <div className="toolbar-tab-content">
          {mobileTab === 'herramientas' && (
            <ToolAndBrushPanel
              activeTool={activeTool} activeBrush={activeBrush}
              onToolChange={onToolChange} onBrushChange={onBrushChange}
            />
          )}
          {mobileTab === 'colores' && (
            <ColorPalette activeColor={activeColor} onChange={onColorChange} />
          )}
        </div>

        <div className="toolbar-mobile-footer">
          <div className="toolbar-tabs">
            <button
              className={`toolbar-tab ${mobileTab === 'herramientas' ? 'active' : ''}`}
              onClick={() => setMobileTab('herramientas')}
            >
              🖌️ Herramientas
            </button>
            <button
              className={`toolbar-tab ${mobileTab === 'colores' ? 'active' : ''}`}
              onClick={() => setMobileTab('colores')}
            >
              🎨 Colores
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
