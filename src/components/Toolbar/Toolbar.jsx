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
  return (
    <aside className="toolbar">
      <div className="toolbar-scroll">
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
    </aside>
  )
}
