import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { RedirectToSignIn, useAuth } from '@clerk/react'

export function LoginPage() {
  const { isLoaded: authLoaded } = useAuth()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!authLoaded) return
    const timer = setTimeout(() => setVisible(false), 400)
    return () => clearTimeout(timer)
  }, [authLoaded])

  if (!visible) return <RedirectToSignIn />

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-head">
          <Icon name="logo" className="auth-logo" style={{ width: 36, height: 28 }} />
          <h1>Tunely</h1>
        </div>
        <p className="auth-sub">The Listening Space</p>
        <p className="auth-sub">
          Redirection vers la connexion...
        </p>
      </div>
    </div>
  )
}
