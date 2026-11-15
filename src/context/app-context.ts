import { createContext, useContext } from 'react'
import type { Participant } from '../data/participants'
import type { Track } from '../data/tracks'

export type Screen = 'login' | 'home' | 'room-host' | 'room-guest'

export type PlaybackMode = 'remote' | 'in-person'

export type User = {
  name: string
  initials: string
  color: string
}

export type Room = {
  code: string
  playback: PlaybackMode
  mode: 'host' | 'guest'
  hostId: string
  ownerId: string
  speakerId: string
  participants: Participant[]
  initialTracks: Track[]
  backendCode?: string | null
}

export type AppContextValue = {
  screen: Screen
  user: User | null
  room: Room | null
  logout: () => void
  createRoom: (playback: PlaybackMode) => void
  enterRoom: (code: string, mode: 'host' | 'guest') => void
  leaveRoom: () => void
  dissolveRoom: () => void
  setHost: (participantId: string) => void
  delegateSpeaker: (participantId: string) => void
  setBackendCode: (code: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

/**
 * Build the local `User` shape from a Clerk `User` object.
 * The app only needs a friendly display name, initials, and a stable color.
 */
export function userFromClerkUser(user: {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
}): User {
  const full = user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const name = full || user.id
  const parts = name.trim().split(/\s+/)
  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  return {
    name,
    initials,
    color: `#000000`,
  }
}
