import { useCallback, useRef, useState } from 'react'
import { IconSprite } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import { Stage } from './components/Stage'
import { QueuePanel } from './components/QueuePanel'
import { StatusStrip } from './components/StatusStrip'
import { AddTrackDialog } from './components/AddTrackDialog'
import { usePlayer } from './hooks/usePlayer'
import './App.css'

function App() {
  const [toast, setToast] = useState('')
  const [roomCode, setRoomCode] = useState('#7F3Q')
  const [adding, setAdding] = useState(false)
  const [queueOpen, setQueueOpen] = useState(true)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const showToast = useCallback((message: string) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const {
    tracks,
    track,
    currentIndex,
    upcomingIndex,
    time,
    playing,
    shuffle,
    repeat,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    selectTrack,
    addTrack,
    newIndex,
  } = usePlayer(showToast)

  const handleNav = useCallback(
    (label: string) => showToast(`${label} : non disponible dans ce prototype`),
    [showToast],
  )

  const copyCode = useCallback(() => {
    const fallback = () => {
      const area = document.createElement('textarea')
      area.value = roomCode
      area.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(area)
      area.select()
      try {
        if (document.execCommand('copy')) showToast(`Code ${roomCode} copié`)
        else showToast(`Copie impossible : ${roomCode}`)
      } catch {
        showToast(`Copie impossible : ${roomCode}`)
      }
      area.remove()
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(roomCode).then(
        () => showToast(`Code ${roomCode} copié`),
        fallback,
      )
    } else {
      fallback()
    }
  }, [roomCode, showToast])

  const createRoom = useCallback(() => {
    const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    let next = '#'
    for (let i = 0; i < 4; i += 1) {
      next += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    setRoomCode(next)
    showToast(`Nouvelle Room simulée · code ${next}`)
  }, [showToast])

  const handleAddTrack = useCallback(
    (title: string, artist: string) => {
      addTrack(title, artist)
      setQueueOpen(true)
    },
    [addTrack],
  )

  return (
    <>
      <IconSprite />
      <main className={playing ? 'shell' : 'shell paused'} id="app">
        <Sidebar
          code={roomCode}
          onCopy={copyCode}
          onCreate={createRoom}
          onNav={handleNav}
        />
        <Stage
          track={track}
          index={currentIndex}
          time={time}
          shuffle={shuffle}
          repeat={repeat}
          onTogglePlay={togglePlay}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onSeek={seekTo}
          onNext={nextTrack}
          onPrev={prevTrack}
        />
        <QueuePanel
          tracks={tracks}
          currentIndex={currentIndex}
          newIndex={newIndex}
          open={queueOpen}
          onToggle={() => setQueueOpen((value) => !value)}
          onPick={selectTrack}
          onAdd={() => setAdding(true)}
        />
        <StatusStrip
          track={track}
          time={time}
          upcoming={tracks[upcomingIndex]}
        />
      </main>

      <AddTrackDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={handleAddTrack}
      />

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
