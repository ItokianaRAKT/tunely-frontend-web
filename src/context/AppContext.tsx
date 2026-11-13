import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { SEED_PARTICIPANTS, YOU_ID } from '../data/participants'
import type { Participant } from '../data/participants'
import { SEED_TRACKS } from '../data/tracks'
import { AppContext } from './app-context'
import type { Room, Screen, User } from './app-context'

const COLORS = ['#3b3d40', '#244cff', '#6a6b6d', '#8a8b8d', '#a5a6a8', '#c2c3c5']
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

function buildCode() {
  let code = '#'
  for (let i = 0; i < 4; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

function normalizeCode(value: string) {
  const raw = value.trim().toUpperCase()
  return raw.startsWith('#') ? raw : `#${raw}`
}

function participantsFor(user: User): Participant[] {
  return SEED_PARTICIPANTS.map((person) =>
    person.id === YOU_ID
      ? { ...person, name: user.name, initials: user.initials, color: user.color }
      : person,
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('login')
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)

  const login = useCallback((name: string) => {
    const parts = name.trim().split(/\s+/)
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase()
    setUser({
      name: parts.join(' '),
      initials,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })
    setScreen('home')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setRoom(null)
    setScreen('login')
  }, [])

  const createRoom = useCallback(() => {
    if (!user) return
    setRoom({
      code: buildCode(),
      mode: 'host',
      hostId: YOU_ID,
      ownerId: YOU_ID,
      participants: participantsFor(user),
      initialTracks: [],
    })
    setScreen('room-host')
  }, [user])

  const enterRoom = useCallback(
    (code: string, mode: 'host' | 'guest') => {
      if (!user) return
      setRoom({
        code: normalizeCode(code),
        mode,
        hostId: mode === 'host' ? YOU_ID : SEED_PARTICIPANTS[0].id,
        ownerId: mode === 'host' ? YOU_ID : SEED_PARTICIPANTS[0].id,
        participants: participantsFor(user),
        initialTracks: SEED_TRACKS,
      })
      setScreen(mode === 'host' ? 'room-host' : 'room-guest')
    },
    [user],
  )

  const leaveRoom = useCallback(() => {
    setRoom(null)
    setScreen('home')
  }, [])

  const dissolveRoom = useCallback(() => {
    if (!room || room.ownerId !== YOU_ID) return
    setRoom(null)
    setScreen('home')
  }, [room])

  const setHost = useCallback((participantId: string) => {
    setRoom((current) =>
      current ? { ...current, hostId: participantId } : current,
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        screen,
        user,
        room,
        login,
        logout,
        createRoom,
        enterRoom,
        leaveRoom,
        dissolveRoom,
        setHost,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}