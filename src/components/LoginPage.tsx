import { useEffect, useState } from 'react'
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/clerk-react'

const signInAppearance = {
  baseTheme: undefined,
  variables: {
    colorBackground: 'var(--card-bg)',
    colorText: 'var(--card-text)',
    colorPrimary: 'var(--blue)',
    colorTextOnPrimaryBackground: '#ffffff',
    colorInputBackground: 'var(--card-bg)',
    colorInputText: 'var(--card-text)',
  },
  elements: {
    rootBox: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '0 auto',
    },
    cardBox: {
      backgroundColor: 'var(--card-bg)',
      boxShadow: '0 20px 50px var(--card-shadow)',
      borderRadius: '16px',
      border: '1px solid var(--card-border)',
      overflow: 'hidden',
      margin: '0 auto',
    },
    card: {
      backgroundColor: 'var(--card-bg)',
      borderRadius: '0px',
      color: 'var(--card-text)',
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
    <div className="auth-shell">
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
  )
}