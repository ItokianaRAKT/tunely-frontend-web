import { useEffect, useState } from 'react'
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/clerk-react'
import { Icon } from './Icon'

export function LoginPage() {
  const { isLoaded } = useAuth()
  const { user } = useUser()
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    const timer = setTimeout(() => setShowSignIn(true), 400)
    return () => clearTimeout(timer)
  }, [isLoaded])

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-head">
          <Icon name="logo" className="auth-logo" style={{ width: 36, height: 28 }} />
          <h1>Tunely</h1>
        </div>
        <p className="auth-sub">The Listening Space</p>

        {showSignIn ? (
          <>
            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className="btn primary">
                  Se connecter avec Clerk
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="auth-profile">
                <UserButton />
                <p className="auth-sub">
                  Connecté en tant que {user?.fullName ?? 'utilisateur'}
                </p>
              </div>
            </SignedIn>
          </>
        ) : (
          <p className="auth-sub">Connexion en cours...</p>
        )}
      </div>
    </div>
  )
}