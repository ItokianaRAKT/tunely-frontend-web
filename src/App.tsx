import { useApp } from './context/app-context'
import { IconSprite } from './components/Icon'
import { LoginPage } from './components/LoginPage'
import { HomePage } from './components/HomePage'
import { RoomHostPage } from './components/RoomHostPage'
import { RoomGuestPage } from './components/RoomGuestPage'
import './App.css'

function App() {
  const { screen } = useApp()

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
