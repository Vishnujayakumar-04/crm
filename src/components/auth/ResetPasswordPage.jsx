import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { verifyResetCode, confirmNewPassword, formatAuthError } from '../../utils/firebase'

export default function ResetPasswordPage({ oobCode, onNavigate }) {
  const [verifyingCode, setVerifyingCode] = useState(true)
  const [targetEmail, setTargetEmail] = useState('')
  const [codeError, setCodeError] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkCode() {
      if (!oobCode) {
        setCodeError('No password reset verification code found in link.')
        setVerifyingCode(false)
        return
      }
      try {
        const email = await verifyResetCode(oobCode)
        setTargetEmail(email || '')
      } catch (err) {
        setCodeError(formatAuthError(err))
      } finally {
        setVerifyingCode(false)
      }
    }

    checkCode()
  }, [oobCode])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await confirmNewPassword(oobCode, password)
      setSuccess(true)
    } catch (err) {
      setSubmitError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  if (verifyingCode) {
    return (
      <div className="text-center py-8 space-y-3">
        <Loader2 size={24} className="animate-spin text-orange-500 mx-auto" />
        <p className="text-xs text-gray-500">Validating password reset security token...</p>
      </div>
    )
  }

  if (codeError) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={24} />
        </div>
        <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
          Reset Link Expired or Invalid
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          {codeError}
        </p>

        <div className="pt-3 flex flex-col gap-2">
          <button
            onClick={() => onNavigate('forgot-password')}
            className="btn-primary w-full py-2.5 text-xs font-semibold"
          >
            <span>Request New Reset Link</span>
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="btn-secondary w-full py-2 text-xs font-semibold"
          >
            <span>Return to Sign In</span>
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
          Password Successfully Reset
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          Your new password is now active for <strong>{targetEmail}</strong>. You can proceed to log in to your portfolio dashboard.
        </p>

        <div className="pt-3">
          <button
            onClick={() => onNavigate('login')}
            className="btn-primary w-full py-2.5 text-sm"
          >
            <span>Sign In with New Password</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 text-xs text-gray-500">
        Resetting password for: <strong className="text-gray-900 dark:text-white">{targetEmail}</strong>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus
              minLength={6}
              className="crm-input pl-11 pr-11 text-sm font-medium"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="crm-input pl-11 pr-11 text-sm font-medium"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              <span>Saving new password...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Save &amp; Update Password</span>
              <ArrowRight size={16} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Cancel &amp; Return to Sign In</span>
        </button>
      </div>
    </div>
  )
}
