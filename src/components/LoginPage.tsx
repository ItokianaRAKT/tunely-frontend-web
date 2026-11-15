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
  elements: {
    card: {
      background: '#121619',
      border: '1px solid rgba(148, 163, 184, 0.28)',
      boxShadow: '0 20px 48px rgba(2, 6, 23, 0.48)',
      borderRadius: '16px',
    },
    rootBox: {
      width: '100%',
    },
    formButtonPrimary: {
      backgroundColor: '#244cff',
      color: '#f8fafc',
      borderRadius: '10px',
    },
  },
  variables: {
    colorBackground: '#121619',
    colorPrimary: '#244cff',
    colorText: '#f8fafc',
    colorTextOnPrimaryBackground: '#f8fafc',
    colorInputBackground: '#0d1117',
    colorInputText: '#f8fafc',
    borderRadius: '12px',
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