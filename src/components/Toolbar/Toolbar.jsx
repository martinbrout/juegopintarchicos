import { useState } from 'react'
import ColorPalette from './ColorPalette'
import BrushSelector from './BrushSelector'
import ToolSelector from './ToolSelector'
import ActionButtons from './ActionButtons'
import './Toolbar.css'

export default function Toolbar({
  activeColor, onColorChange,
  activeBrush, onBrushChange,
  activeTool, onToolChange,
  canUndo, canRedo,
  onUndo, onRedo, onClear,
  onSave, onPrint,
  isMusicOn, onToggleMusic,
  onOpenFigures,
}) {
  const [mobileTab, setMobileTab] = useState('herramienta')

  const sharedProps = {
    activeColor, onColorChange,
    activeBrush, onBrushChange,
    activeTool, onToolChange,
  }

  return (
    <aside className="toolbar">
      {/* ── Desktop layout ── */}
      <div className="toolbar-scroll toolbar-desktop">
        <ToolSelector activeTool={activeTool} onChange={onToolChange} />
        <div className="toolbar-divider" />
        <BrushSelector activeBrush={activeBrush} onChange={onBrushChange} onSwitchToDraw={() => onToolChange('draw')} />
        <div className="toolbar-divider" />
        <ColorPalette activeColor={activeColor} onChange={onColorChange} />
        <div className="toolbar-divider" />
        <ActionButtons
          canUndo={canUndo} canRedo={canRedo}
          onUndo={onUndo} onRedo={onRedo} onClear={onClear}
          onSave={onSave} onPrint={onPrint}
          isMusicOn={isMusicOn} onToggleMusic={onToggleMusic}
          onOpenFigures={onOpenFigures}
        />
      </div>

      {/* ── Mobile layout ── */}
      <div className="toolbar-mobile">
        <div className="toolbar-tab-content">
          {mobileTab === 'modo' && (
            <ToolSelector activeTool={activeTool} onChange={onToolChange} />
          )}
          {mobileTab === 'herramienta' && (
            <BrushSelector activeBrush={activeBrush} onChange={onBrushChange} onSwitchToDraw={() => onToolChange('draw')} />
          )}
          {mobileTab === 'colores' && (
            <ColorPalette activeColor={activeColor} onChange={onColorChange} />
          )}
        </div>

        <div className="toolbar-mobile-footer">
          <div className="toolbar-tabs">
            <button
              className={`toolbar-tab ${mobileTab === 'modo' ? 'active' : ''}`}
              onClick={() => setMobileTab('modo')}
            >
              🎮 Modo
            </button>
            <button
              className={`toolbar-tab ${mobileTab === 'herramienta' ? 'active' : ''}`}
              onClick={() => setMobileTab('herramienta')}
            >
              🖌️ Pincel
            </button>
            <button
              className={`toolbar-tab ${mobileTab === 'colores' ? 'active' : ''}`}
              onClick={() => setMobileTab('colores')}
            >
              🎨 Colores
            </button>
          </div>
          <ActionButtons
            canUndo={canUndo} canRedo={canRedo}
            onUndo={onUndo} onRedo={onRedo} onClear={onClear}
            onSave={onSave} onPrint={onPrint}
            isMusicOn={isMusicOn} onToggleMusic={onToggleMusic}
            onOpenFigures={onOpenFigures}
          />
        </div>
      </div>
    </aside>
  )
}
