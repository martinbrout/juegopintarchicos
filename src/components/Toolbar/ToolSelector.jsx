import { TOOLS, TOOL_LABELS, TOOL_ICONS } from '../../constants/tools'
import './ToolButton.css'

const TOOL_LIST = [TOOLS.DRAW, TOOLS.FILL, TOOLS.STICKER, TOOLS.PHOTO]

export default function ToolSelector({ activeTool, onChange }) {
  return (
    <div className="tool-group">
      <span className="tool-group-label">Modo</span>
      <div className="tool-buttons">
        {TOOL_LIST.map(tool => (
          <button
            key={tool}
            className={`tool-btn ${activeTool === tool ? 'active' : ''}`}
            onClick={() => onChange(tool)}
            title={TOOL_LABELS[tool]}
          >
            <span className="tool-icon">{TOOL_ICONS[tool]}</span>
            <span className="tool-label">{TOOL_LABELS[tool]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
