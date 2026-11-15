import { useEffect, useState } from 'react'
import { SignIn, UserButton, useAuth, useUser } from '@clerk/react'
import { dark } from '@clerk/themes'

const signInAppearance =
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? dark
    : undefined

export function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    const timer = setTimeout(() => setShowSignIn(true), 400)
    return () => clearTimeout(timer)
  }, [isLoaded])

  if (!isLoaded) {
    return (
      <div className="auth-shell">
        <p className="auth-sub">Connexion en cours...</p>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      {showSignIn ? (
        isSignedIn && user ? (
          <div className="auth-profile">
            <UserButton />
            <p className="auth-sub">Connecté en tant que {user.fullName ?? 'utilisateur'}</p>
          </div>
        ) : (
          <SignIn appearance={signInAppearance} />
        )
      ) : (
        <p className="auth-sub">Connexion en cours...</p>
      )}
    </div>
  )
}