import { useCallback, useRef, useState } from 'react'
import { IconSprite } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import './App.css'

function App() {
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const showToast = useCallback((message: string) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const handleNav = useCallback(
    (label: string) => showToast(`${label} : non disponible dans ce prototype`),
    [showToast],
  )

  return (
    <>
      <IconSprite />
      <main className="shell" id="app">
        <Sidebar onNav={handleNav} />
        <section className="stage" aria-label="En cours de lecture" />
        <div className="right qopen" id="right" />
        <footer className="strip" />
      </main>

      <div
        id="toast"
        className={toast ? 'on' : undefined}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </>
  )
}

export default App
