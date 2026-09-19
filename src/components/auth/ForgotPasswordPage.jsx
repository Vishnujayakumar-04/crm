import { useState } from 'react'
import { Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { sendPasswordReset, formatAuthError, isFirebaseConfigured } from '../../utils/firebase'
import FirebaseConfigAlert from './FirebaseConfigAlert'

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const configured = isFirebaseConfigured()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your registered email address.')
      return
    }

    setLoading(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
          Password Reset Email Sent
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          We have sent a secure password reset link to <strong>{email}</strong>. Please check your inbox and spam folder, then follow the instructions in the email.
        </p>

        <div className="pt-3">
          <button
            onClick={() => onNavigate('login')}
            className="btn-secondary w-full py-2.5 text-xs font-semibold"
          >
            <ArrowLeft size={15} />
            <span>Return to Sign In</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {!configured && <FirebaseConfigAlert />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email"
              required
              autoFocus
              className="crm-input pl-11 text-sm font-medium"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2 py-2.5 text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Sending reset link...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Send Reset Instructions</span>
              <ArrowRight size={16} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  )
}
