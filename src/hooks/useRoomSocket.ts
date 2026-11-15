import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
  RoomMode,
  ServerRoomState,
  SocketStatus,
} from '../types/ws'

const DEFAULT_WS_URL = 'ws://localhost:8000/ws'

type UseRoomSocketResult = {
  status: SocketStatus
  serverRoomState: ServerRoomState | null
  clockOffset: number
  sendPlay: (videoId: string, startAt: number) => void
  sendPause: (pausedAtPosition: number) => void
  sendAddTrack: (track: ServerRoomState['queue'][number]) => void
  sendToggleVote: (trackId: string) => void
  sendVoteSkip: () => void
}

export function useRoomSocket(roomCode?: string | null): UseRoomSocketResult {
  const { getToken } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef(0)
  const reconnectTimerRef = useRef<number | null>(null)
  const [status, setStatus] = useState<SocketStatus>('disconnected')
  const [clockOffset, setClockOffset] = useState(0)
  const [serverRoomState, setServerRoomState] = useState<ServerRoomState | null>(null)

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
          queue: message.queue,
          currentTrack: message.currentTrack,
          isPlaying: message.isPlaying,
          startAt: message.startAt,
          pausedAtPosition: message.isPlaying ? null : null,
          skipVotes: message.skipVotes ?? null,
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
                queue: message.queue,
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

  const sendMessage = useCallback((message: OutgoingWebSocketMessage) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify(message))
  }, [])

  const sendPlay = useCallback(
    (videoId: string, startAt: number) => {
      sendMessage({
        type: 'HOST_PLAY',
        videoId,
        startAt,
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

  const sendAddTrack = useCallback(
    (track: ServerRoomState['queue'][number]) => {
      sendMessage({
        type: 'ADD_TRACK',
        track,
        serverTime: Date.now() + clockOffset,
      })
    },
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
      setStatus('disconnected')
      return
    }

    const token = await getToken()
    if (!token) {
      setStatus('disconnected')
      return
    }

    const wsBase = (import.meta.env.VITE_WS_URL as string | undefined) ?? DEFAULT_WS_URL
    const socketUrl = `${wsBase.replace(/\/$/, '')}/${encodeURIComponent(roomCode)}?token=${encodeURIComponent(token)}`

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
        const message = JSON.parse(event.data) as IncomingWebSocketMessage
        applyIncomingMessage(message)
      } catch {
        // ignore malformed payloads until the server contract is stabilized
      }
    }

    socket.onerror = () => {
      setStatus((current) => (current === 'connected' ? 'reconnecting' : current))
    }

    socket.onclose = () => {
      wsRef.current = null
      setStatus('disconnected')

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
    sendPlay,
    sendPause,
    sendAddTrack,
    sendToggleVote,
    sendVoteSkip,
  }
}

export type RoomSocketInstance = ReturnType<typeof useRoomSocket>
export type RoomSocketMode = RoomMode
