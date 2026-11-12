import { useCallback, useRef, useState } from 'react'
import { Icon, IconSprite } from './components/Icon'
import type { IconName } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import { Stage } from './components/Stage'
import { QueuePanel } from './components/QueuePanel'
import type { Vote } from './components/QueuePanel'
import { StatusStrip } from './components/StatusStrip'
import { AddTrackDialog } from './components/AddTrackDialog'
import { usePlayer } from './hooks/usePlayer'
import { SEED_PARTICIPANTS, YOU_ID } from './data/participants'
import './App.css'

type Toast = { text: string; icon?: IconName }

function App() {
  const [toast, setToast] = useState<Toast | null>(null)
  const [roomCode, setRoomCode] = useState('#7F3Q')
  const [adding, setAdding] = useState(false)
  const [queueOpen, setQueueOpen] = useState(true)
  const [votes, setVotes] = useState<Record<number, Vote>>({})
  const [hostId, setHostId] = useState(YOU_ID)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const showToast = useCallback((message: string, icon?: IconName) => {
    setToast(icon ? { text: message, icon } : { text: message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const {
    tracks,
    track,
    currentIndex,
    upcomingIndex,
    time,
    playing,
    togglePlay,
    seekTo,
    addTrack,
    newIndex,
    pausePlayback,
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

  const quitRoom = useCallback(() => {
    pausePlayback()
    showToast('Room quittée (simulation) · lecture en pause')
  }, [pausePlayback, showToast])

  const handleVote = useCallback(
    (index: number, vote: Vote) => {
      const title = tracks[index].title
      setVotes((current) => {
        if (current[index] === vote) {
          showToast(`Vote retiré · ${title}`)
          const next = { ...current }
          delete next[index]
          return next
        }
        showToast(
          `Vote enregistré · ${title}`,
          vote === 'up' ? 'like' : 'dislike',
        )
        return { ...current, [index]: vote }
      })
    },
    [tracks, showToast],
  )

  const canNameHost = hostId === YOU_ID

  const nameHost = useCallback(
    (id: string) => {
      const host = SEED_PARTICIPANTS.find((person) => person.id === id)
      if (!host || id === hostId) return
      setHostId(id)
      showToast(`${host.name} est désormais hôte · vous perdez ce pouvoir`)
    },
    [hostId, showToast],
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
          onTogglePlay={togglePlay}
          onSeek={seekTo}
        />
        <QueuePanel
          tracks={tracks}
          currentIndex={currentIndex}
          newIndex={newIndex}
          votes={votes}
          open={queueOpen}
          onToggle={() => setQueueOpen((value) => !value)}
          onVote={handleVote}
          onAdd={() => setAdding(true)}
          onQuit={quitRoom}
        />
        <StatusStrip
          track={track}
          time={time}
          upcoming={tracks[upcomingIndex]}
          participants={SEED_PARTICIPANTS}
          hostId={hostId}
          canNameHost={canNameHost}
          onNameHost={nameHost}
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
        {toast?.icon && (
          <Icon
            name={toast.icon}
            className={toast.icon === 'like' ? 'up' : undefined}
          />
        )}
        {toast?.text}
      </div>
    </>
  )
}

export default App
