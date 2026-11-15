import { Show, SignInButton, SignUpButton } from '@clerk/react'
import { Icon } from './Icon'

export function LoginPage() {
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
      </div>
    </div>
  )
}
