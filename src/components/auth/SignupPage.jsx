import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Check, X } from 'lucide-react'
import { registerWithEmail, formatAuthError, isFirebaseConfigured } from '../../utils/firebase'
import FirebaseConfigAlert from './FirebaseConfigAlert'

export default function SignupPage({ onNavigate, onSignupSuccess }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  const configured = isFirebaseConfigured()

  const hasMinLength = password.length >= 6
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (!hasMinLength) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.')
      return
    }
    if (!acceptTerms) {
      setError('Please acknowledge the security terms to proceed.')
      return
    }

    setLoading(true)
    try {
      const user = await registerWithEmail(email, password, fullName)
      setSuccessInfo({
        email: user.email,
        name: fullName.trim()
      })
      if (onSignupSuccess) {
        onSignupSuccess(user)
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  if (successInfo) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-sm">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
            Account Created Successfully!
          </h3>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
            Welcome, <strong className="text-gray-900 dark:text-white">{successInfo.name}</strong>. Your account has been registered with <strong className="text-gray-900 dark:text-white">{successInfo.email}</strong>.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('login')}
            className="btn-primary w-full py-2.5 text-sm"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={16} />
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
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50 leading-relaxed">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              required
              autoFocus
              className="crm-input pl-11 text-sm font-medium"
              placeholder="e.g. Vishnu J"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              className="crm-input pl-11 text-sm font-medium"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Create Password
          </label>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              className="crm-input pl-11 pr-11 text-sm font-medium"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              className="crm-input pl-11 pr-11 text-sm font-medium"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Live Password Hints */}
        {password.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] pt-0.5">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
              hasMinLength ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
            }`}>
              {hasMinLength ? <Check size={11} /> : <X size={11} />}
              <span>Min. 6 characters</span>
            </span>
            {confirmPassword.length > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                passwordsMatch ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              }`}>
                {passwordsMatch ? <Check size={11} /> : <X size={11} />}
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </span>
            )}
          </div>
        )}

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400 leading-normal select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4 flex-shrink-0"
            />
            <span>I agree to store my private financial records securely in this portfolio.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2 py-2.5 text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Creating your account...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Create Account</span>
              <ArrowRight size={16} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
        Already have a registered account?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}
