import { useApp } from './context/app-context'
import { IconSprite } from './components/Icon'
import { LoginPage } from './components/LoginPage'
import { HomePage } from './components/HomePage'
import { RoomHostPage } from './components/RoomHostPage'
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
  return <RoomHostPage />
}

export default App
