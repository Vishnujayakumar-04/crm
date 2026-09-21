import { useState, useEffect } from 'react'
import AuthLayout from './auth/AuthLayout'
import LoginPage from './auth/LoginPage'
import SignupPage from './auth/SignupPage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import ResetPasswordPage from './auth/ResetPasswordPage'

export default function AuthGate({ onUnlock, theme, onToggleTheme }) {
  const [page, setPage] = useState('login')
  const [oobCode, setOobCode] = useState('')

  // Inspect URL parameters for Firebase email action links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const mode = params.get('mode')
      const code = params.get('oobCode')

      if ((mode === 'resetPassword' || mode === 'reset') && code) {
        setOobCode(code)
        setPage('reset-password')
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [])

  const pageHeaders = {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to access your portfolio, holdings, and fixed deposits.'
    },
    signup: {
      title: 'Create an account',
      subtitle: 'Join Portfolio CRM to track your Indian shares, funds, and savings in one place.'
    },
    'forgot-password': {
      title: 'Forgot your password?',
      subtitle: 'Enter your registered email address to receive a secure Firebase reset link.'
    },
    'reset-password': {
      title: 'Create new password',
      subtitle: 'Choose a strong new password to protect your wealth portfolio.'
    }
  }

  const currentHeader = pageHeaders[page] || pageHeaders.login

  return (
    <AuthLayout
      theme={theme}
      onToggleTheme={onToggleTheme}
      title={currentHeader.title}
      subtitle={currentHeader.subtitle}
    >
      {page === 'login' && (
        <LoginPage
          onNavigate={setPage}
          onLoginSuccess={onUnlock}
        />
      )}

      {page === 'signup' && (
        <SignupPage
          onNavigate={setPage}
          onSignupSuccess={onUnlock}
        />
      )}

      {page === 'forgot-password' && (
        <ForgotPasswordPage
          onNavigate={setPage}
        />
      )}

      {page === 'reset-password' && (
        <ResetPasswordPage
          oobCode={oobCode}
          onNavigate={setPage}
        />
      )}
    </AuthLayout>
  )
}