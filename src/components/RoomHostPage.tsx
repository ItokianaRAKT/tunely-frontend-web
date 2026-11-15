import { useCallback, useRef, useState } from 'react'
import { Icon, IconSprite, type IconName } from './Icon'
import { Sidebar } from './Sidebar'
import { Stage } from './Stage'
import { QueuePanel } from './QueuePanel'
import type { Vote } from './QueuePanel'
import { StatusStrip } from './StatusStrip'
import { AddTrackDialog } from './AddTrackDialog'
import { usePlayer } from '../hooks/usePlayer'
import { createBackendRoom, resolveVideoId } from '../api/tunely'
import { SEED_PARTICIPANTS, YOU_ID } from '../data/participants'
import { SEED_TRACKS } from '../data/tracks'
import { useApp } from '../context/app-context'

export function RoomHostPage() {
  const { room, createRoom, leaveRoom, dissolveRoom, setHost, setBackendCode } =
    useApp()
  const participants = room?.participants ?? SEED_PARTICIPANTS
  const initialTracks = room?.initialTracks ?? SEED_TRACKS
  const [toast, setToast] = useState<{ text: string; icon?: IconName } | null>(null)
  const [adding, setAdding] = useState(false)
  const [queueOpen, setQueueOpen] = useState(true)
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [hostId, setHostId] = useState(room?.hostId ?? YOU_ID)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((message: string, icon?: IconName) => {
    setToast(icon ? { text: message, icon } : { text: message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const backendRoomRef = useRef<Promise<string | null> | null>(null)
  const backendNoticeRef = useRef(false)
  const youtubeNoticeRef = useRef(false)

  const noticeBackendDown = useCallback(() => {
    if (backendNoticeRef.current) return
    backendNoticeRef.current = true
    showToast('Backend injoignable · lecture simulée')
  }, [showToast])

  const ensureBackendRoom = useCallback(() => {
    if (room?.backendCode) return Promise.resolve(room.backendCode)
    if (!backendRoomRef.current) {
      const label = room?.code ? `Tunely ${room.code}` : 'Tunely'
      backendRoomRef.current = createBackendRoom(label).then((code) => {
        if (!code) {
          backendRoomRef.current = null
          return null
        }
        setBackendCode(code)
        return code
      })
    }
    return backendRoomRef.current
  }, [room, setBackendCode])

  const adoptTrack = useCallback(
    (target: { title: string; artist: string }) =>
      ensureBackendRoom().then((code) => {
        if (!code) {
          noticeBackendDown()
          return null
        }
        return resolveVideoId(code, target.title, target.artist).then((video) => {
          if (video && !youtubeNoticeRef.current) {
            youtubeNoticeRef.current = true
            showToast('Lecture YouTube connectée')
          }
          return video
        })
      }),
    [ensureBackendRoom, noticeBackendDown, showToast],
  )

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
  } = usePlayer(showToast, initialTracks, { youtube: true, adopt: adoptTrack })

  const handleNav = useCallback(
    (label: string) => {
      if (label === 'Accueil' || label === 'Mes Rooms') {
        pausePlayback()
        leaveRoom()
        return
      }
      showToast(`${label} : non disponible dans ce prototype`)
    },
    [pausePlayback, leaveRoom, showToast],
  )

  const code = room?.code ?? ''

  const copyCode = useCallback(() => {
    const fallback = () => {
      const area = document.createElement('textarea')
      area.value = code
      area.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(area)
      area.select()
      try {
        if (document.execCommand('copy')) showToast(`Code ${code} copié`)
        else showToast(`Copie impossible : ${code}`)
      } catch {
        showToast(`Copie impossible : ${code}`)
      }
      area.remove()
    }

    if (navigator.clipboard?.writeText && code) {
      navigator.clipboard.writeText(code).then(
        () => showToast(`Code ${code} copié`),
        fallback,
      )
    } else {
      fallback()
    }
  }, [code, showToast])

  const handleAddTrack = useCallback(
    (title: string, artist: string) => {
      addTrack(title, artist)
      setQueueOpen(true)
    },
    [addTrack],
  )

  const quitRoom = useCallback(() => {
    pausePlayback()
    leaveRoom()
  }, [pausePlayback, leaveRoom])

  const handleVote = useCallback(
    (index: number, vote: Vote) => {
      const title = tracks[index]?.title
      if (!title) return
      setVotes((current) => {
        if (current[title] === vote) {
          showToast(`Vote retiré · ${title}`)
          const next = { ...current }
          delete next[title]
          return next
        }
        showToast(
          `Vote enregistré · ${title}`,
          vote === 'up' ? 'like' : 'dislike',
        )
        return { ...current, [title]: vote }
      })
    },
    [tracks, showToast],
  )

  const nameHost = useCallback(
    (id: string) => {
      if (id === hostId) return
      const host = participants.find((p) => p.id === id)
      if (!host) return
      setHostId(id)
      setHost(id)
      showToast(`${host.name} est désormais hôte · vous perdez ce pouvoir`)
    },
    [hostId, participants, setHost, showToast],
  )

  const canNameHost = hostId === YOU_ID
  const isOwner = room?.ownerId === YOU_ID

  const dissolve = useCallback(() => {
    pausePlayback()
    dissolveRoom()
  }, [pausePlayback, dissolveRoom])

  return (
    <>
      <IconSprite />
      <main className={playing ? 'shell' : 'shell paused'} id="app">
        <Sidebar
          code={room?.code ?? '#7F3Q'}
          canDissolve={isOwner}
          onCopy={copyCode}
          onCreate={() => {
            createRoom()
            showToast('Nouvelle Room créée')
          }}
          onNav={handleNav}
          onDissolve={dissolve}
        />
        <Stage
          track={track}
          index={currentIndex}
          time={time}
          readOnly={false}
          onTogglePlay={togglePlay}
          onSeek={seekTo}
        />
        <QueuePanel
          tracks={tracks}
          currentIndex={currentIndex}
          newIndex={newIndex}
          votes={votes}
          canAdd
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
          participants={participants}
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
          <Icon name={toast.icon} className={toast.icon === 'like' ? 'up' : undefined} />
        )}
        {toast?.text}
      </div>
    </>
  )
}