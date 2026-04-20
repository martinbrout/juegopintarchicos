import { useRef, useState } from 'react'

const MAX_HISTORY = 30

export function useHistory() {
  const undoStack = useRef([])
  const redoStack = useRef([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  function sync() {
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }

  // Push the state AFTER a change (so undo restores to this state later)
  function pushSnapshot(imageData) {
    undoStack.current.push(imageData)
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = []
    sync()
  }

  // Returns the snapshot to restore (the one before the latest), or null to clear
  function undo() {
    if (undoStack.current.length === 0) return null
    const popped = undoStack.current.pop()
    redoStack.current.push(popped)
    sync()
    return undoStack.current[undoStack.current.length - 1] ?? null
  }

  function redo() {
    if (redoStack.current.length === 0) return null
    const snapshot = redoStack.current.pop()
    undoStack.current.push(snapshot)
    sync()
    return snapshot
  }

  function clear() {
    undoStack.current = []
    redoStack.current = []
    sync()
  }

  return { pushSnapshot, undo, redo, clear, canUndo, canRedo }
}
