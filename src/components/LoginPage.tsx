import { useEffect, useState } from 'react'
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/clerk-react'
import { Icon } from './Icon'

const signInAppearance = {
  baseTheme: undefined,
  elements: {
    cardBox: {
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0px',
    },
    rootBox: {
      width: '100%',
    },
  },
}

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
              <SignIn appearance={signInAppearance} />
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