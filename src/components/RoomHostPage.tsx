import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, IconSprite, type IconName } from './Icon'
import { Sidebar } from './Sidebar'
import { Stage } from './Stage'
import { QueuePanel } from './QueuePanel'
import type { Vote } from './QueuePanel'
import { StatusStrip } from './StatusStrip'
import { AddTrackDialog } from './AddTrackDialog'
import { ModeChoiceDialog } from './ModeChoiceDialog'
import { usePlayer } from '../hooks/usePlayer'
import { createBackendRoom, proposeTrack, resolveVideoId } from '../api/tunely'
import { SEED_PARTICIPANTS } from '../data/participants'
import { SEED_TRACKS } from '../data/tracks'
import type { NewTrack } from '../data/tracks'
import { useApp } from '../context/app-context'
import type { RoomMode } from '../types/ws'

export function RoomHostPage() {
  const {
    room,
    user,
    userId,
    roomSocket,
    getToken,
    createRoom,
    leaveRoom,
    dissolveRoom,
    setHost,
    delegateSpeaker,
    setBackendCode,
  } = useApp()
  const participants = room?.participants ?? SEED_PARTICIPANTS
  const initialTracks = room?.initialTracks ?? SEED_TRACKS
  const meId = user?.id ?? ''
  const fallbackHostId = meId || SEED_PARTICIPANTS[0].id
  const fallbackSpeakerId = meId || SEED_PARTICIPANTS[0].id
  const [toast, setToast] = useState<{ text: string; icon?: IconName } | null>(null)
  const [adding, setAdding] = useState(false)
  const [creating, setCreating] = useState(false)
  const [queueOpen, setQueueOpen] = useState(true)
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [hostId, setHostId] = useState(room?.hostId ?? fallbackHostId)
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
      backendRoomRef.current = createBackendRoom(getToken, label).then((code) => {
        if (!code) {
          backendRoomRef.current = null
          return null
        }
        setBackendCode(code)
        return code
      })
    }
    return backendRoomRef.current
  }, [getToken, room, setBackendCode])

  const adoptTrack = useCallback(
    (target: { title: string; artist: string; duration?: number; official?: boolean }) =>
      ensureBackendRoom().then((code) => {
        if (!code) {
          noticeBackendDown()
          return null
        }
        // Only an official (iTunes) duration may act as the expected length
        // of the YouTube video; mock durations would filter out everything.
        const expected = target.official ? target.duration : undefined
        return resolveVideoId(getToken, code, target.title, target.artist, expected).then((video) => {
          if (video && !youtubeNoticeRef.current) {
            youtubeNoticeRef.current = true
            showToast('Lecture YouTube connectée')
          }
          return video
        })
      }),
    [ensureBackendRoom, getToken, noticeBackendDown, showToast],
  )

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
    togglePlay,
    skipTrack,
    seekTo,
    addTrack,
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
    adopt: adoptTrack,
  })

  useEffect(() => {
    if (!room || room.mode !== 'host' || !userId) return
    const mode: RoomMode = room.playback === 'remote' ? 'REMOTE' : 'PARTY'
    const nextPlayerUserId = room.playback === 'remote' ? userId : userId
    roomSocket.sendUpdateRoomSettings(mode, nextPlayerUserId)
  }, [room, roomSocket, userId])

  const canTogglePlayback = userId === (serverRoomState?.hostId ?? room?.hostId ?? userId)
  const handleTogglePlay = useCallback(() => {
    if (!canTogglePlayback || !track) return
    // In PARTY mode the server never drives the local player, so the host's
    // command must be applied locally as well (fall back to the local state
    // when no backend room is connected).
    const shouldPause = serverRoomState ? serverRoomState.isPlaying : playing
    if (shouldPause) {
      roomSocket.sendPause(time)
      if (playing) pausePlayback()
      return
    }
    // Identify the played song on the server so it becomes the room's
    // current track (protected from removal, advanced on skip).
    const serverTrack = serverRoomState?.queue.find(
      (item) =>
        (track.youtubeId != null && item.youtubeId === track.youtubeId) ||
        (item.title === track.title && item.artist === track.artist),
    )
    roomSocket.sendPlay(
      track.youtubeId ?? '',
      Date.now() + roomSocket.clockOffset,
      serverTrack?.id || undefined,
    )
    if (!playing) togglePlay()
  }, [canTogglePlayback, pausePlayback, playing, roomSocket, serverRoomState, time, togglePlay, track])

  const handleSeek = useCallback(
    (seconds: number) => {
      if (!canTogglePlayback) return
      seekTo(seconds)
      roomSocket.sendHostSeek(seconds)
    },
    [canTogglePlayback, roomSocket, seekTo],
  )

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
    (input: NewTrack) => {
      const title = input.title.trim()
      const artist = input.artist.trim()
      const normalized = { ...input, title, artist }
      const trackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setQueueOpen(true)
      setAdding(false)

      const sent = roomSocket.sendAddTrack({
        id: trackId,
        title,
        artist,
        youtubeId: null,
        votes: 0,
        addedByUserId: userId ?? null,
        durationSeconds: input.duration ?? null,
      })

      if (sent) {
        // The server owns the queue (QUEUE_SYNC refreshes the panel), but
        // the local list still drives the stage: mirror the addition so a
        // fresh room is not stuck on an empty stage.
        addTrack(normalized)
        return
      }

      // Socket unavailable: mirror through REST and report the real outcome.
      void ensureBackendRoom()
        .then((code) => {
          if (!code) throw new Error('Backend unreachable')
          return proposeTrack(getToken, code, title, artist, input.duration)
        })
        .then(() => {
          addTrack(normalized)
        })
        .catch(() => {
          showToast('Ajout impossible · serveur injoignable')
        })
    },
    [addTrack, ensureBackendRoom, getToken, roomSocket, showToast, userId],
  )

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

  // The room state owns the "now playing" marker; fall back to the local
  // player index while no server state is available.
  const serverCurrentIndex = serverRoomState?.currentTrack
    ? queueTracks.findIndex((item) => item.id === serverRoomState.currentTrack?.id)
    : -1
  const displayedIndex = serverCurrentIndex >= 0 ? serverCurrentIndex : currentIndex

  const handleVoteSkip = useCallback(() => {
    roomSocket.sendVoteSkip()
    showToast('Vote pour passer enregistré')
  }, [roomSocket, showToast])

  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      const target = queueTracks.find((item) => item.id === trackId)
      roomSocket.sendRemoveTrack(trackId)
      showToast(
        target ? `« ${target.title} » retiré de la file` : 'Titre retiré de la file',
      )
    },
    [queueTracks, roomSocket, showToast],
  )

  const handleSkip = useCallback(() => {
    if (!canTogglePlayback) return
    roomSocket.sendHostSkip()
    skipTrack()
    showToast('Chanson passée')
  }, [canTogglePlayback, roomSocket, skipTrack, showToast])

  return (
    <>
      <IconSprite />
      <main className={playing ? 'shell' : 'shell paused'} id="app">
        <Sidebar
          code={room?.code ?? '#7F3Q'}
          playback={room?.playback ?? 'in-person'}
          canDissolve={isOwner}
          onCopy={copyCode}
          onCreate={() => setCreating(true)}
          onNav={handleNav}
          onDissolve={dissolve}
        />
        <Stage
          track={track}
          index={displayedIndex}
          time={time}
          readOnly={!canTogglePlayback}
          canTogglePlayback={canTogglePlayback}
          banner={stageBanner}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onSkip={handleSkip}
        />
        <QueuePanel
          tracks={queueTracks}
          currentIndex={displayedIndex}
          newIndex={newIndex}
          votes={votes}
          skipVotes={serverRoomState?.skipVotes ?? null}
          canAdd
          canRemove={canTogglePlayback}
          open={queueOpen}
          onToggle={() => setQueueOpen((value) => !value)}
          onVote={handleVote}
          onVoteSkip={handleVoteSkip}
          onAdd={() => setAdding(true)}
          onRemove={handleRemoveTrack}
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

      <AddTrackDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={handleAddTrack}
      />

      <ModeChoiceDialog
        open={creating}
        onClose={() => setCreating(false)}
        onChoose={(playback) => {
          createRoom(playback)
          setCreating(false)
          showToast('Nouvelle Room créée')
        }}
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