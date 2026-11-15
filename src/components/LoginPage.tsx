import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Icon } from './Icon'
import { useApp } from '../context/app-context'

export function LoginPage() {
  const { login } = useApp()
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError(true)
      return
    }
    login(trimmed)
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-head">
          <Icon name="logo" className="auth-logo" style={{ width: 36, height: 28 }} />
          <h1>Tunely</h1>
        </div>
        <p className="auth-sub">The Listening Space</p>
        <Show when="signed-out">
          <div className="auth-cta">
            <SignInButton mode="modal">
              <button type="button" className="btn">
                Se connecter
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="btn primary">
                Créer un compte
              </button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <div className="auth-user">
            <UserButton />
          </div>
        </Show>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Votre nom</span>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex, Sam, Maya…"
              maxLength={24}
              autoComplete="name"
              autoFocus
            />
          </label>
          {error && <p className="auth-err">Au moins 2 caractères</p>}
          <button type="submit" className="btn primary" disabled={name.trim().length < 2}>
            Entrer
          </button>
        </form>
        <p className="auth-note">
          Un nom suffit pour entrer — un compte reste optionnel.
        </p>
      </div>
    </div>
  )
}