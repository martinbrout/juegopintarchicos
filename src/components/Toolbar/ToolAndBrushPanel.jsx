import { TOOLS, TOOL_LABELS, TOOL_ICONS } from '../../constants/tools'
import { BRUSHES, BRUSH_LABELS, BRUSH_ICONS } from '../../constants/brushes'
import './ToolButton.css'

const MODE_TOOLS = [TOOLS.FILL, TOOLS.STICKER]
const BRUSH_LIST = [BRUSHES.PENCIL, BRUSHES.MARKER, BRUSHES.WATERCOLOR, BRUSHES.ERASER]

export default function ToolAndBrushPanel({ activeTool, activeBrush, onToolChange, onBrushChange }) {
  function handleBrush(brush) {
    onBrushChange(brush)
    onToolChange(TOOLS.DRAW)
  }

  return (
    <div className="tool-group">
      <span className="tool-group-label">Herramientas</span>
      <div className="tool-buttons">
        {MODE_TOOLS.map(tool => (
          <button
            key={tool}
            className={`tool-btn ${activeTool === tool ? 'active' : ''}`}
            onClick={() => onToolChange(tool)}
            title={TOOL_LABELS[tool]}
          >
            <span className="tool-icon">{TOOL_ICONS[tool]}</span>
            <span className="tool-label">{TOOL_LABELS[tool]}</span>
          </button>
        ))}
        {BRUSH_LIST.map(brush => (
          <button
            key={brush}
            className={`tool-btn ${activeTool === TOOLS.DRAW && activeBrush === brush ? 'active' : ''}`}
            onClick={() => handleBrush(brush)}
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
