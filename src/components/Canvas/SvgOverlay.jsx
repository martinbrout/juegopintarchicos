export default function SvgOverlay({ src, isBackground }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: isBackground ? 1 : 20,
        pointerEvents: 'none',
        userSelect: 'none',
        objectFit: 'contain',
      }}
    />
  )
}
