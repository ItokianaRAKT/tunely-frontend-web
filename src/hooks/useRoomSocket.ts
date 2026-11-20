import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
  QueueTrack,
  RoomMode,
  RoomParticipant,
  ServerRoomState,
  SocketStatus,
} from '../types/ws'

const DEFAULT_WS_URL = 'ws://localhost:8000'

// The backend serializes queue items with its own vocabulary
// (videoId / score / artworkUrl); map it onto the client contract.
type ServerQueueTrack = {
  id?: string
  title?: string
  artist?: string
  videoId?: string | null
  youtubeId?: string | null
  score?: number
  votes?: number
  artworkUrl?: string | null
  art?: string | null
  durationSeconds?: number | null
}

function normalizeQueue(queue: unknown): QueueTrack[] {
  if (!Array.isArray(queue)) return []
  return queue.map((raw) => {
    const item = (typeof raw === 'object' && raw !== null ? raw : {}) as ServerQueueTrack
    return {
      id: item.id ?? '',
      title: item.title ?? 'Titre inconnu',
      artist: item.artist ?? 'Artiste inconnu',
      youtubeId: item.youtubeId ?? item.videoId ?? null,
      votes: item.votes ?? item.score ?? 0,
      durationSeconds: item.durationSeconds ?? null,
      art: item.art ?? item.artworkUrl ?? null,
    }
  })
}

type ServerParticipant = {
  id?: number
  username?: string
  role?: string
  userId?: string | null
}

function normalizeParticipants(list: unknown): RoomParticipant[] {
  if (!Array.isArray(list)) return []
  return list.map((raw) => {
    const item = (typeof raw === 'object' && raw !== null ? raw : {}) as ServerParticipant
    return {
      id: item.id ?? 0,
      username: item.username ?? '',
      role: item.role ?? 'guest',
      userId: item.userId ?? null,
    }
  })
}

type UseRoomSocketResult = {
  status: SocketStatus
  serverRoomState: ServerRoomState | null
  clockOffset: number
  kicked: boolean
  sendPlay: (videoId: string, startAt: number, trackId?: string) => void
  sendPause: (pausedAtPosition: number) => void
  sendHostSeek: (position: number) => void
  sendRemoveTrack: (trackId: string) => void
  sendHostSkip: () => void
  sendKickParticipant: (username: string) => void
  sendAddTrack: (track: ServerRoomState['queue'][number]) => boolean
  sendToggleVote: (trackId: string) => void
  sendVoteSkip: () => void
  sendUpdateRoomSettings: (mode?: RoomMode, playerUserId?: string | null) => void
}

export function useRoomSocket(roomCode?: string | null): UseRoomSocketResult {
  const { getToken } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef(0)
  const reconnectTimerRef = useRef<number | null>(null)
  const [status, setStatus] = useState<SocketStatus>('disconnected')
  const [clockOffset, setClockOffset] = useState(0)
  const [serverRoomState, setServerRoomState] = useState<ServerRoomState | null>(null)
  // Set when the server closes our socket with 4403 (kicked by the host).
  const [kicked, setKicked] = useState(false)

  const applyIncomingMessage = useCallback((message: IncomingWebSocketMessage) => {
    if ('serverTime' in message) {
      setClockOffset(message.serverTime - Date.now())
    }

    switch (message.type) {
      case 'ROOM_STATE': {
        setServerRoomState({
          serverTime: message.serverTime,
          mode: message.mode,
          hostId: message.hostId,
          playerUserId: message.playerUserId,
          queue: normalizeQueue(message.queue),
          currentTrack: message.currentTrack,
          isPlaying: message.isPlaying,
          startAt: message.startAt,
          pausedAtPosition: message.pausedAtPosition ?? null,
          skipVotes: message.skipVotes ?? null,
          participants: normalizeParticipants(message.participants),
        })
        break
      }
      case 'SYNC_PLAY': {
        setServerRoomState((current) =>
          current
            ? {
                ...current,
                isPlaying: true,
                startAt: message.startAt,
                pausedAtPosition: null,
                serverTime: message.serverTime,
              }
            : current,
        )
        break
      }
      case 'SYNC_PAUSE': {
        setServerRoomState((current) =>
          current
            ? {
                ...current,
                isPlaying: false,
                serverTime: message.serverTime,
                startAt: null,
                pausedAtPosition: message.pausedAtPosition,
              }
            : current,
        )
        break
      }
      case 'QUEUE_SYNC': {
        setServerRoomState((current) =>
          current
            ? {
                ...current,
                queue: normalizeQueue(message.queue),
                serverTime: message.serverTime,
              }
            : current,
        )
        break
      }
      case 'SKIP_VOTES_UPDATE': {
        setServerRoomState((current) =>
          current
            ? {
                ...current,
                skipVotes: {
                  count: message.count,
                  required: message.required,
                },
                serverTime: message.serverTime,
              }
            : current,
        )
        break
      }
      case 'ROOM_SETTINGS_UPDATED': {
        setServerRoomState((current) => {
          if (!current) return current
          return {
            ...current,
            serverTime: message.serverTime,
            mode: message.mode ?? current.mode,
            playerUserId: message.playerUserId ?? current.playerUserId,
          }
        })
        break
      }
      default:
        break
    }
  }, [])

  const sendMessage = useCallback((message: OutgoingWebSocketMessage): boolean => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return false
    if (message.type === 'ADD_TRACK') {
      // The backend reads the track fields directly from `data`.
      const { track, serverTime } = message
      wsRef.current.send(JSON.stringify({ event: message.type, data: { ...track, serverTime } }))
      return true
    }
    const { type, ...data } = message
    wsRef.current.send(JSON.stringify({ event: type, data }))
    return true
  }, [])

  const sendPlay = useCallback(
    (videoId: string, startAt: number, trackId?: string) => {
      sendMessage({
        type: 'HOST_PLAY',
        videoId,
        startAt,
        trackId,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const sendPause = useCallback(
    (pausedAtPosition: number) => {
      sendMessage({
        type: 'HOST_PAUSE',
        pausedAtPosition,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const sendHostSeek = useCallback(
    (position: number) => {
      sendMessage({
        type: 'HOST_SEEK',
        position,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const sendRemoveTrack = useCallback(
    (trackId: string) => {
      sendMessage({
        type: 'REMOVE_TRACK',
        trackId,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const sendHostSkip = useCallback(() => {
    sendMessage({
      type: 'HOST_SKIP',
      serverTime: Date.now() + clockOffset,
    })
  }, [clockOffset, sendMessage])

  const sendKickParticipant = useCallback(
    (username: string) => {
      sendMessage({
        type: 'KICK_PARTICIPANT',
        username,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const sendAddTrack = useCallback(
    (track: ServerRoomState['queue'][number]): boolean =>
      sendMessage({
        type: 'ADD_TRACK',
        track,
        serverTime: Date.now() + clockOffset,
      }),
    [clockOffset, sendMessage],
  )

  const sendToggleVote = useCallback(
    (trackId: string) => {
      sendMessage({
        type: 'TOGGLE_VOTE',
        trackId,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const sendVoteSkip = useCallback(() => {
    sendMessage({
      type: 'VOTE_SKIP',
      serverTime: Date.now() + clockOffset,
    })
  }, [clockOffset, sendMessage])

  const sendUpdateRoomSettings = useCallback(
    (mode?: RoomMode, playerUserId?: string | null) => {
      sendMessage({
        type: 'UPDATE_ROOM_SETTINGS',
        mode,
        playerUserId,
        serverTime: Date.now() + clockOffset,
      })
    },
    [clockOffset, sendMessage],
  )

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('disconnected')
  }, [])

  const connect = useCallback(async () => {
    if (!roomCode) {
      setServerRoomState(null)
      setKicked(false)
      setStatus('disconnected')
      return
    }

    const token = await getToken()
    if (!token) {
      setStatus('disconnected')
      return
    }

    const wsBase = (import.meta.env.VITE_WS_URL as string | undefined) ?? DEFAULT_WS_URL
    const cleanCode = roomCode.replace(/^#/, '')
    const socketUrl = `${wsBase.replace(/\/$/, '')}/rooms/${cleanCode}/ws?token=${encodeURIComponent(token)}`

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return
    }

    const socket = new WebSocket(socketUrl)
    wsRef.current = socket
    setStatus(reconnectRef.current > 0 ? 'reconnecting' : 'connecting')

    socket.onopen = () => {
      reconnectRef.current = 0
      setStatus('connected')
    }

    socket.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data) as Record<string, unknown>
        // The server wraps everything as { event, data }.
        const message =
          typeof raw.event === 'string'
            ? ({
                type: raw.event,
                ...(typeof raw.data === 'object' && raw.data !== null ? raw.data : {}),
              } as IncomingWebSocketMessage)
            : (raw as IncomingWebSocketMessage)
        applyIncomingMessage(message)
      } catch {
        // ignore malformed payloads until the server contract is stabilized
      }
    }

    socket.onerror = () => {
      setStatus((current) => (current === 'connected' ? 'reconnecting' : current))
    }

    socket.onclose = (event) => {
      wsRef.current = null
      setStatus('disconnected')

      if (event.code === 4403) {
        // The host kicked us out: never reconnect to this room.
        setKicked(true)
        return
      }

      if (!roomCode) return

      reconnectRef.current += 1
      const delay = Math.min(800 + reconnectRef.current * 250, 4000)
      reconnectTimerRef.current = window.setTimeout(() => {
        void connect()
      }, delay)
    }
  }, [applyIncomingMessage, getToken, roomCode])

  useEffect(() => {
    if (!roomCode) {
      disconnect()
      setServerRoomState(null)
      setKicked(false)
      return undefined
    }

    void connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect, roomCode])

  return {
    status,
    serverRoomState,
    clockOffset,
    kicked,
    sendPlay,
    sendPause,
    sendHostSeek,
    sendRemoveTrack,
    sendHostSkip,
    sendKickParticipant,
    sendAddTrack,
    sendToggleVote,
    sendVoteSkip,
    sendUpdateRoomSettings,
  }
}

export type RoomSocketInstance = ReturnType<typeof useRoomSocket>
export type RoomSocketMode = RoomMode
