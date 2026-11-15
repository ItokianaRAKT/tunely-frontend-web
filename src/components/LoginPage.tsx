import { SignIn, UserButton, useAuth, useUser } from '@clerk/react'
import { dark } from '@clerk/themes'

const signInAppearance = {
  baseTheme: dark,
} as any

export function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) {
    return (
      <div className="auth-shell">
        <p className="auth-sub">Connexion en cours...</p>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      {isSignedIn && user ? (
        <div className="auth-profile">
          <UserButton />
          <p className="auth-sub">Connecté en tant que {user.fullName ?? 'utilisateur'}</p>
        </div>
      ) : (
        <SignIn appearance={signInAppearance} />
      )}
    </div>
  )
}
