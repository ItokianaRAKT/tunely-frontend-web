import { useEffect } from 'react'
import { useUser } from '@clerk/react'
import { useApp } from './context/app-context'
import { IconSprite } from './components/Icon'
import { LoginPage } from './components/LoginPage'
import { HomePage } from './components/HomePage'
import { RoomHostPage } from './components/RoomHostPage'
import { RoomGuestPage } from './components/RoomGuestPage'
import './App.css'

function App() {
  const { screen, login, logout } = useApp()
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user && screen === 'login') {
      login(user.fullName || user.username || user.firstName || 'Invité')
    } else if (!isSignedIn && screen !== 'login') {
      logout()
    }
  }, [isLoaded, isSignedIn, user, screen, login, logout])

  if (screen === 'login')
    return (
      <>
        <IconSprite />
        <LoginPage />
      </>
    )
  if (screen === 'home')
    return (
      <>
        <IconSprite />
        <HomePage />
      </>
    )
  if (screen === 'room-guest') return <RoomGuestPage />
  return <RoomHostPage />
}

export default App
