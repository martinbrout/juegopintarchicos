import { PALETTE } from '../../constants/colors'
import './ColorPalette.css'

export default function ColorPalette({ activeColor, onChange }) {
  return (
    <div className="color-palette">
      {PALETTE.map(color => (
        <button
          key={color}
          className={`color-swatch ${activeColor === color ? 'active' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          title={color}
          aria-label={`Color ${color}`}
        />
      ))}
    </div>
  )
}
