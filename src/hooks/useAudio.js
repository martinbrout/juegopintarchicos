import { useEffect, useRef, useState } from 'react'

// Howler is loaded lazily to avoid issues if audio files are missing
let Howl = null

async function loadHowler() {
  if (!Howl) {
    const mod = await import('howler')
    Howl = mod.Howl
  }
  return Howl
}

const SFX_FILES = {
  pincel: '/audio/sfx/pincel.mp3',
  relleno: '/audio/sfx/relleno.mp3',
  sticker: '/audio/sfx/sticker.mp3',
  guardar: '/audio/sfx/guardar.mp3',
  borrar: '/audio/sfx/borrar.mp3',
  seleccion: '/audio/sfx/seleccion.mp3',
}

const BRUSH_RATES = {
  pencil: 1.2,
  marker: 0.9,
  crayon: 1.0,
  eraser: 0.8,
}

export function useAudio() {
  const sounds = useRef({})
  const bgMusic = useRef(null)
  const [isMusicOn, setIsMusicOn] = useState(() => {
    try { return localStorage.getItem('musicOn') !== 'false' } catch { return true }
  })
  const initialized = useRef(false)

  async function init() {
    if (initialized.current) return
    initialized.current = true
    const HowlClass = await loadHowler()

    bgMusic.current = new HowlClass({
      src: ['/audio/music/fondo.mp3'],
      loop: true,
      volume: 0.35,
      html5: true,
    })

    for (const [key, src] of Object.entries(SFX_FILES)) {
      sounds.current[key] = new HowlClass({ src: [src], volume: 0.7 })
    }

    if (isMusicOn) {
      bgMusic.current.play()
    }
  }

  function playSfx(name, brushType) {
    const sound = sounds.current[name]
    if (!sound) return
    if (brushType && BRUSH_RATES[brushType]) {
      sound.rate(BRUSH_RATES[brushType])
    }
    sound.play()
  }

  function toggleMusic() {
    setIsMusicOn(prev => {
      const next = !prev
      try { localStorage.setItem('musicOn', String(next)) } catch {}
      if (bgMusic.current) {
        if (next) bgMusic.current.play()
        else bgMusic.current.pause()
      }
      return next
    })
  }

  // Initialize on first user gesture
  function handleFirstGesture() {
    init()
    window.removeEventListener('pointerdown', handleFirstGesture)
  }

  useEffect(() => {
    window.addEventListener('pointerdown', handleFirstGesture)
    return () => window.removeEventListener('pointerdown', handleFirstGesture)
  }, [])

  return { playSfx, toggleMusic, isMusicOn }
}
