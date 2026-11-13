import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from './Icon'
import { useApp } from '../context/app-context'

const RECENT_ROOMS = [
  { code: '#7F3Q', name: 'Vendredi Soir', date: 'Il y a 2 jours', participants: 4 },
  { code: '#K9M2', name: 'Road Trip', date: 'La semaine dernière', participants: 3 },
  { code: '#P4XW', name: 'Dimanche Chill', date: 'Il y a 3 semaines', participants: 5 },
]

export function HomePage() {
  const { user, createRoom, enterRoom, logout } = useApp()
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState(false)
  const joinRef = useRef<HTMLInputElement>(null)

  const handleJoin = (e: FormEvent) => {
    e.preventDefault()
    const raw = joinCode.trim().toUpperCase()
    const code = raw.startsWith('#') ? raw : `#${raw}`
    if (!/^#[A-Z0-9]{4}$/.test(code)) {
      setJoinError(true)
      return
    }
    enterRoom(code, 'guest')
  }

  return (
    <div className="home">
      <header className="home-head">
        <div className="home-greeting">
          <Icon name="logo" style={{ width: 28, height: 22 }} />
          <div>
            <h1>Bonjour, <b>{user?.name}</b></h1>
            <p>Prêt à écouter ensemble ?</p>
          </div>
        </div>
        <div className="home-actions">
          <button className="btn ghost" onClick={logout}>
            Se déconnecter
          </button>
          <button className="btn primary create-room" onClick={createRoom}>
            <Icon name="plus" style={{ width: 16, height: 16 }} />
            Créer une Room
          </button>
        </div>
      </header>
      <section className="home-section">
        <div className="section-head">
          <h2>Rejoindre une Room</h2>
        </div>
        <form onSubmit={handleJoin} className="join-form">
          <input
            ref={joinRef}
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^#A-Z0-9]/g, ''))}
            placeholder="Code (ex: #7F3Q)"
            maxLength={5}
            autoComplete="off"
          />
          {joinError && <p className="join-err">Format : # + 4 caractères</p>}
          <button type="submit" className="btn" disabled={joinCode.replace('#', '').length < 4}>
            Rejoindre
          </button>
        </form>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Mes Rooms récentes</h2>
        </div>
        <ul className="rooms-list">
          {RECENT_ROOMS.map((r) => (
            <li key={r.code} className="room-card">
              <div className="room-info">
                <div className="room-code">
                  <Icon name="folder" style={{ width: 15, height: 15 }} />
                  <span>{r.code}</span>
                </div>
                <div className="room-meta">
                  <b>{r.name}</b>
                  <small>{r.date} · {r.participants} participants</small>
                </div>
              </div>
              <button className="btn ghost" onClick={() => enterRoom(r.code, 'host')}>
                Ouvrir
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}