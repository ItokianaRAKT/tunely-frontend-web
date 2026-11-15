import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { SEED_PARTICIPANTS, YOU_ID } from '../data/participants'
import type { Participant } from '../data/participants'
import { SEED_TRACKS } from '../data/tracks'
import { AppContext, userFromClerkUser } from './app-context'
import type { PlaybackMode, Room, Screen, User } from './app-context'

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
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth()
  const { user: clerkUser } = useUser()

  const [screen, setScreen] = useState<Screen>('login')
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!authLoaded) return
    if (hasInitialized.current) return
    hasInitialized.current = true

    const nextUser =
      isSignedIn && clerkUser
        ? { ...userFromClerkUser(clerkUser), color: COLORS[Math.abs(clerkUser.id.length) % COLORS.length] }
        : null
    const nextScreen = isSignedIn && clerkUser ? 'home' : 'login'
    setUser(nextUser)
    setScreen(nextScreen)
  }, [authLoaded, isSignedIn, clerkUser])

  const login = useCallback(() => {
    // Auth is now handled by Clerk; this remains in the context interface
    // for compat but is not the path used by the app anymore.
  }, [])

  const logout = useCallback(() => {
    void signOut()
    setUser(null)
    setRoom(null)
    setScreen('login')
  }, [signOut])

  const createRoom = useCallback(
    (playback: PlaybackMode) => {
      if (!user) return
      setRoom({
        code: buildCode(),
        playback,
        mode: 'host',
        hostId: YOU_ID,
        ownerId: YOU_ID,
        speakerId: YOU_ID,
        participants: participantsFor(user),
        initialTracks: [],
      })
      setScreen('room-host')
    },
    [user],
  )

  const enterRoom = useCallback(
    (code: string, mode: 'host' | 'guest') => {
      if (!user) return
      const hostId = mode === 'host' ? YOU_ID : SEED_PARTICIPANTS[0].id
      setRoom({
        code: normalizeCode(code),
        playback: 'in-person',
        mode,
        hostId,
        ownerId: hostId,
        speakerId: hostId,
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

  const delegateSpeaker = useCallback((participantId: string) => {
    setRoom((current) =>
      current && current.playback === 'in-person'
        ? { ...current, speakerId: participantId }
        : current,
    )
  }, [])

  const setBackendCode = useCallback((code: string) => {
    setRoom((current) =>
      current ? { ...current, backendCode: code } : current,
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
        delegateSpeaker,
        setBackendCode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}