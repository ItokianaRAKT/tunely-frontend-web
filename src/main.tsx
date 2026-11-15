import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext'

const publishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

if (!publishableKey) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env.local and set it.',
  )
}

const clerkAppearance = {
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

const clerkLocalization = {
  signIn: {
    start: {
      title: 'Tunely',
      subtitle: 'The Listening Space',
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      localization={clerkLocalization}
    >
      <AppProvider>
        <App />
      </AppProvider>
    </ClerkProvider>
  </StrictMode>,
)
