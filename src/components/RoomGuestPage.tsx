import { useCallback, useRef, useState } from 'react'
import { Icon, IconSprite, type IconName } from './Icon'
import { Sidebar } from './Sidebar'
import { Stage } from './Stage'
import { QueuePanel } from './QueuePanel'
import type { Vote } from './QueuePanel'
import { StatusStrip } from './StatusStrip'
import { usePlayer } from '../hooks/usePlayer'
import { SEED_PARTICIPANTS } from '../data/participants'
import { SEED_TRACKS } from '../data/tracks'
import { useApp } from '../context/app-context'

export function RoomGuestPage() {
  const { room, user, userId, roomSocket, leaveRoom, dissolveRoom, setHost, delegateSpeaker } =
    useApp()
  const participants = room?.participants ?? SEED_PARTICIPANTS
  const initialTracks = room?.initialTracks ?? SEED_TRACKS
  const meId = user?.id ?? ''
  const fallbackHostId = meId || SEED_PARTICIPANTS[1].id
  const fallbackSpeakerId = meId || SEED_PARTICIPANTS[0].id
  const [toast, setToast] = useState<{ text: string; icon?: IconName } | null>(null)
  const [queueOpen, setQueueOpen] = useState(true)
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [hostId, setHostId] = useState(room?.hostId ?? fallbackHostId)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((message: string, icon?: IconName) => {
    setToast(icon ? { text: message, icon } : { text: message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const serverRoomState = roomSocket.serverRoomState
  const shouldPlayAudio =
    serverRoomState == null ? true :
    serverRoomState.mode === 'REMOTE' ? true :
    serverRoomState.playerUserId === userId

  const {
    tracks,
    track,
    currentIndex,
    upcomingIndex,
    time,
    playing,
    newIndex,
    pausePlayback,
  } = usePlayer(showToast, initialTracks, {
    youtube: true,
    shouldPlayAudio,
    roomSync:
      serverRoomState == null
        ? null
        : {
            mode: serverRoomState.mode,
            isPlaying: serverRoomState.isPlaying,
            startAt: serverRoomState.startAt,
            clockOffset: roomSocket.clockOffset,
            pausedAtPosition: serverRoomState.pausedAtPosition ?? null,
            serverTime: serverRoomState.serverTime,
          },
  })

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

  const quitRoom = useCallback(() => {
    pausePlayback()
    leaveRoom()
  }, [pausePlayback, leaveRoom])

  const handleVote = useCallback(
    (trackId: string, vote: Vote) => {
      const queueForVote = ((serverRoomState?.queue ?? tracks) as Array<{
        id?: string
        title: string
        artist: string
        duration?: number
        durationSeconds?: number | null
        art?: string
      }>)
      const target = queueForVote.find((item) => item.id === trackId)
      if (!target) return

      setVotes((current) => {
        if (current[trackId] === vote) {
          showToast(`Vote retiré · ${target.title}`)
          const next = { ...current }
          delete next[trackId]
          return next
        }

        roomSocket.sendToggleVote(trackId)
        showToast(
          `Vote enregistré · ${target.title}`,
          vote === 'up' ? 'like' : 'dislike',
        )
        return { ...current, [trackId]: vote }
      })
    },
    [roomSocket, serverRoomState?.queue, showToast, tracks],
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

  const canNameHost = hostId === meId
  const isOwner = room?.ownerId === meId
  const playbackMode = room?.playback ?? 'in-person'
  const speakerId = room?.speakerId ?? fallbackSpeakerId
  const canControl =
    playbackMode === 'remote' ? hostId === meId : speakerId === meId
  const speakerName = participants.find((p) => p.id === speakerId)?.name
  const stageBanner = canControl
    ? undefined
    : playbackMode === 'remote'
      ? "Lecture seule · l'hôte contrôle la lecture"
      : `Lecture sur le téléphone de ${speakerName ?? "l'hôte"}`

  const handleDelegate = useCallback(
    (id: string) => {
      const target = participants.find((p) => p.id === id)
      const givingBack = id === hostId && id !== meId
      delegateSpeaker(id)
      if (id === meId) showToast('Lecture reprise · vous pilotez la musique')
      else if (givingBack) showToast(`Lecture rendue à ${target?.name ?? 'l’hôte'}`)
      else showToast(`Lecture donnée à ${target?.name ?? 'ce participant'}`)
    },
    [participants, hostId, meId, delegateSpeaker, showToast],
  )

  const dissolve = useCallback(() => {
    pausePlayback()
    dissolveRoom()
  }, [pausePlayback, dissolveRoom])

  const queueEntries = ((serverRoomState?.queue.length ? serverRoomState.queue : tracks) as Array<{
    id?: string
    title: string
    artist: string
    duration?: number
    durationSeconds?: number | null
    art?: string
  }>)

  const queueTracks: Array<{ id: string; title: string; artist: string; duration?: number; art?: string }> =
    queueEntries.map((track, index) => ({
      id: track.id ?? `${track.title}-${index}`,
      title: track.title,
      artist: track.artist,
      duration: track.durationSeconds ?? track.duration,
      art: track.art,
    }))

  const handleVoteSkip = useCallback(() => {
    roomSocket.sendVoteSkip()
    showToast('Vote pour passer enregistré')
  }, [roomSocket, showToast])

  return (
    <>
      <IconSprite />
      <main className={playing ? 'shell' : 'shell paused'} id="app">
        <Sidebar
          code={room?.code ?? '#7F3Q'}
          playback={room?.playback ?? 'in-person'}
          canDissolve={isOwner}
          onCopy={copyCode}
          onCreate={() =>
            showToast('Invité : la création de Room reste ouverte à chacun')
          }
          onNav={handleNav}
          onDissolve={dissolve}
        />
        <Stage
          track={track}
          index={currentIndex}
          time={time}
          readOnly={true}
          canTogglePlayback={false}
          banner={stageBanner}
          onTogglePlay={() => undefined}
          onSeek={() => undefined}
        />
        <QueuePanel
          tracks={queueTracks}
          currentIndex={currentIndex}
          newIndex={newIndex}
          votes={votes}
          skipVotes={serverRoomState?.skipVotes ?? null}
          participantCount={participants.length}
          canAdd={false}
          open={queueOpen}
          onToggle={() => setQueueOpen((value) => !value)}
          onVote={handleVote}
          onVoteSkip={handleVoteSkip}
          onAdd={() => {}}
          onQuit={quitRoom}
        />
        <StatusStrip
          track={track}
          time={time}
          upcoming={tracks[upcomingIndex]}
          participants={participants}
          hostId={hostId}
          playback={room?.playback ?? 'in-person'}
          speakerId={room?.speakerId ?? fallbackSpeakerId}
          viewerId={meId}
          canNameHost={canNameHost}
          onNameHost={nameHost}
          onDelegate={handleDelegate}
        />
      </main>

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