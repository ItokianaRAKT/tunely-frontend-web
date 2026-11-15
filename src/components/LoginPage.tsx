import { useEffect, useState } from 'react'
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

const signInAppearance = {
  baseTheme:
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? dark
      : undefined,
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