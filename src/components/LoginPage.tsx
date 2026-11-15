import { useState } from 'react'
import type { MouseEvent } from 'react'
import { SignIn, SignUp } from '@clerk/react'

export function LoginPage() {
  const [signingUp, setSigningUp] = useState(false)

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

  return (
    <div className="auth" onClickCapture={handleAuthLinkClick}>
      {signingUp ? (
        <SignUp routing="hash" signInUrl="#/sign-in" />
      ) : (
        <SignIn routing="hash" signUpUrl="#/sign-up" />
      )}
    </div>
  )
}
