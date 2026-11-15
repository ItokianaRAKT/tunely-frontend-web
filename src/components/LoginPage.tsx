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

  // Without a router, Clerk's cross-flow links navigate to its hosted pages.
  // Intercept them so the sign-in and sign-up flows both stay in the app.
  const handleAuthLinkClick = (e: MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href') ?? ''
    if (href.includes('sign-up')) {
      e.preventDefault()
      e.stopPropagation()
      setSigningUp(true)
    } else if (href.includes('sign-in')) {
      e.preventDefault()
      e.stopPropagation()
      setSigningUp(false)
    }
  }

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
        <SignIn routing="hash" signUpUrl="#/sign-up" />
      )}
    </div>
  )
}
