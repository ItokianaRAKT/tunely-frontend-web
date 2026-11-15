export type RoomMode = 'PARTY' | 'REMOTE'

export type QueueTrack = {
  id: string
  title: string
  artist: string
  youtubeId?: string | null
  votes: number
  addedByUserId?: string | null
  durationSeconds?: number | null
}

export type ServerRoomState = {
  serverTime: number
  mode: RoomMode
  hostId: string
  playerUserId: string | null
  queue: QueueTrack[]
  currentTrack: {
    id: string
    title: string
    artist: string
    youtubeId?: string | null
    durationSeconds?: number | null
  } | null
  isPlaying: boolean
  startAt: number | null
  pausedAtPosition?: number | null
  skipVotes?: {
    count: number
    required: number
  } | null
}

export type IncomingRoomStateMessage = {
  type: 'ROOM_STATE'
  serverTime: number
  mode: RoomMode
  hostId: string
  playerUserId: string | null
  queue: QueueTrack[]
  currentTrack: ServerRoomState['currentTrack']
  isPlaying: boolean
  startAt: number | null
  skipVotes?: {
    count: number
    required: number
  } | null
}

export type IncomingSyncPlayMessage = {
  type: 'SYNC_PLAY'
  serverTime: number
  videoId: string
  startAt: number
}

export type IncomingSyncPauseMessage = {
  type: 'SYNC_PAUSE'
  serverTime: number
  pausedAtPosition: number
}

export type IncomingQueueSyncMessage = {
  type: 'QUEUE_SYNC'
  serverTime: number
  queue: QueueTrack[]
}

export type IncomingSkipVotesMessage = {
  type: 'SKIP_VOTES_UPDATE'
  serverTime: number
  count: number
  required: number
}

export type IncomingRoomSettingsUpdatedMessage = {
  type: 'ROOM_SETTINGS_UPDATED'
  serverTime: number
  mode?: RoomMode
  playerUserId?: string | null
}

export type IncomingWebSocketMessage =
  | IncomingRoomStateMessage
  | IncomingSyncPlayMessage
  | IncomingSyncPauseMessage
  | IncomingQueueSyncMessage
  | IncomingSkipVotesMessage
  | IncomingRoomSettingsUpdatedMessage

export type OutgoingHostPlayMessage = {
  type: 'HOST_PLAY'
  videoId: string
  startAt: number
  serverTime: number
}

export type OutgoingHostPauseMessage = {
  type: 'HOST_PAUSE'
  pausedAtPosition: number
  serverTime: number
}

export type OutgoingAddTrackMessage = {
  type: 'ADD_TRACK'
  track: QueueTrack
  serverTime: number
}

export type OutgoingToggleVoteMessage = {
  type: 'TOGGLE_VOTE'
  trackId: string
  serverTime: number
}

export type OutgoingVoteSkipMessage = {
  type: 'VOTE_SKIP'
  serverTime: number
}

export type OutgoingUpdateRoomSettingsMessage = {
  type: 'UPDATE_ROOM_SETTINGS'
  mode?: RoomMode
  playerUserId?: string | null
  serverTime: number
}

export type OutgoingWebSocketMessage =
  | OutgoingHostPlayMessage
  | OutgoingHostPauseMessage
  | OutgoingAddTrackMessage
  | OutgoingToggleVoteMessage
  | OutgoingVoteSkipMessage
  | OutgoingUpdateRoomSettingsMessage

export type SocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
