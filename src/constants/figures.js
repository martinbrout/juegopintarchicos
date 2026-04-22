const figureUrls = import.meta.glob(
  '/src/assets/figures/*',
  { eager: true, query: '?url', import: 'default' }
)

const FIGURE_META = {
  corazon:  { name: 'Corazón',   emoji: '💖' },
  bluey:    { name: 'Bluey',     emoji: '🐾' },
}

function parseName(path) {
  const base = path.split('/').pop().replace(/\.[^.]+$/, '')
  return base.charAt(0).toUpperCase() + base.slice(1).replace(/[-_ ]/g, ' ')
}

const dynamicFigures = Object.entries(figureUrls).map(([path, url]) => {
  const id = path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase().replace(/\s+/g, '_')
  const key = id.replace(/_\d+$/, '').replace(/\d+$/, '')
  const meta = FIGURE_META[key] ?? FIGURE_META[id] ?? { name: parseName(path), emoji: '🖼️' }
  return { id, name: meta.name, emoji: meta.emoji, src: url, refSrc: url }
})

export const FIGURES = [
  { id: 'libre', name: 'Lienzo libre', src: null, refSrc: null, emoji: '🎨' },
  ...dynamicFigures,
]

export const STICKERS = [
  { id: 'estrella', name: 'Estrella', src: './stickers/estrella.svg' },
  { id: 'corazon', name: 'Corazón', src: './stickers/corazon.svg' },
  { id: 'sol', name: 'Sol', src: './stickers/sol.svg' },
  { id: 'luna', name: 'Luna', src: './stickers/luna.svg' },
  { id: 'nube', name: 'Nube', src: './stickers/nube.svg' },
  { id: 'arcoiris', name: 'Arcoíris', src: './stickers/arcoiris.svg' },
  { id: 'sparkle', name: 'Brillito', src: './stickers/sparkle.svg' },
  { id: 'flor', name: 'Florcita', src: './stickers/flor.svg' },
]
