import { IconSprite } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import './App.css'

function App() {
  return (
    <>
      <IconSprite />
      <main className="shell" id="app">
        <Sidebar />
        <section className="stage" aria-label="En cours de lecture" />
        <div className="right qopen" id="right" />
        <footer className="strip" />
      </main>

      <div id="toast" role="status" aria-live="polite" />
    </>
  )
}

export default App
