import { createContext, useContext } from 'react'
import type { Participant } from '../data/participants'
import type { Track } from '../data/tracks'

export type Screen = 'login' | 'home' | 'room-host' | 'room-guest'

export type User = {
  name: string
  initials: string
  color: string
}

export type Room = {
  code: string
  mode: 'host' | 'guest'
  hostId: string
  ownerId: string
  participants: Participant[]
  initialTracks: Track[]
  backendCode?: string | null
}

export type AppContextValue = {
  screen: Screen
  user: User | null
  room: Room | null
  login: (name: string) => void
  logout: () => void
  createRoom: () => void
  enterRoom: (code: string, mode: 'host' | 'guest') => void
  leaveRoom: () => void
  dissolveRoom: () => void
  setHost: (participantId: string) => void
  setBackendCode: (code: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}