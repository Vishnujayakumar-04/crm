import { useState } from 'react'
import {
  User,
  Shield,
  Download,
  Upload,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileSpreadsheet,
  LogOut,
  Mail,
  Send
} from 'lucide-react'
import {
  exportDataAsJSON,
  parseImportedJSON,
  clearAllData
} from '../utils/storage'
import { sendPasswordReset, isFirebaseConfigured, formatAuthError } from '../utils/firebase'

export default function SettingsTab({ data, onUpdateData, onUpdateProfile, onLogout, currentUser }) {
  const [name, setName] = useState(data.profile?.name || currentUser?.displayName || 'Investor')
  const [profileSaved, setProfileSaved] = useState(false)

  // Password reset email state
  const [resetSending, setResetSending] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')

  // Import state
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  function handleSaveProfile(e) {
    e.preventDefault()
    onUpdateProfile({ name: name.trim() || 'Investor' })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  async function handleSendResetEmail() {
    const targetEmail = currentUser?.email
    if (!targetEmail) {
      setResetError('No email associated with current session.')
      return
    }

    setResetSending(true)
    setResetError('')
    setResetMessage('')

    try {
      await sendPasswordReset(targetEmail)
      setResetMessage(`Password reset link dispatched to ${targetEmail}. Check your inbox.`)
    } catch (err) {
      setResetError(formatAuthError(err))
    } finally {
      setResetSending(false)
    }
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError('')
    setImportSuccess('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result
        if (typeof content === 'string') {
          const validatedData = parseImportedJSON(content)
          onUpdateData(validatedData)
          setImportSuccess(`Successfully imported ${validatedData.holdings.length} holdings and ${validatedData.savings.length} savings entries!`)
        }
      } catch (err) {
        setImportError(`Import failed: ${err.message || 'Invalid JSON backup file'}`)
      }
    }
    reader.readAsText(file)
  }

  function handleResetAll() {
    if (window.confirm('CAUTION: This will permanently delete all portfolio positions, savings records, and cached data for this account from this browser.\n\nAre you sure you want to reset everything?')) {
      clearAllData(currentUser?.uid)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Settings & Preferences
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal profile, security credentials, and data backups
        </p>
      </div>

      {/* Authenticated Account Overview Card */}
      {currentUser && (
        <section className="crm-card p-6 border-orange-200/80 dark:border-orange-950/40 bg-gradient-to-r from-orange-50/50 via-white to-white dark:from-[#1c1d22] dark:to-[#181b22]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 font-heading text-lg font-bold text-white shadow-md shadow-orange-500/20">
                {(data.profile?.name || currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
                    {data.profile?.name || currentUser.displayName || 'Portfolio Investor'}
                  </h3>
                  <span className="badge-green text-[10px]">Active Session</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {currentUser.email || 'Local User'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn-secondary self-start sm:self-auto text-xs py-2 px-3.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/40"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      )}

      {/* Profile Section */}
      <section className="crm-card p-6">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
              User Profile
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize how your portfolio greets you
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="max-w-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              className="crm-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">
              Save Profile
            </button>
            {profileSaved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Saved
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Security & Password */}
      <section className="crm-card p-6">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
              Password &amp; Security
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Request a secure password reset link for your registered email
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          {resetError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle size={15} />
              <span>{resetError}</span>
            </div>
          )}
          {resetMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 size={15} />
              <span>{resetMessage}</span>
            </div>
          )}

          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Need to update your password? Click below to dispatch an official Firebase password reset email to <strong>{currentUser?.email || 'your account'}</strong>.
          </p>

          <button
            type="button"
            disabled={resetSending || !currentUser?.email}
            onClick={handleSendResetEmail}
            className="btn-secondary text-xs"
          >
            <Send size={14} />
            <span>{resetSending ? 'Sending reset link...' : 'Send Password Reset Email'}</span>
          </button>
        </div>
      </section>

      {/* Data Backup & Restore */}
      <section className="crm-card p-6">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
              Data Portability & Backup
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Export and restore your portfolio across devices or browser profiles
            </p>
          </div>
        </div>

        {importError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle size={15} />
            <span>{importError}</span>
          </div>
        )}
        {importSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 size={15} />
            <span>{importSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Export */}
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">
              Export JSON Backup
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Download your complete positions, savings records, and history as a backup file.
            </p>
            <button
              onClick={() => exportDataAsJSON(data)}
              className="mt-4 btn-secondary text-xs"
            >
              <Download size={15} /> Export Portfolio Data (.json)
            </button>
          </div>

          {/* Import */}
          <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">
              Import from Backup
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Restore portfolio positions from a previously exported JSON backup file.
            </p>
            <label className="mt-4 inline-flex items-center gap-2 cursor-pointer btn-secondary text-xs">
              <Upload size={15} /> Select Backup File
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileImport}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Security Disclosure & Reset */}
      <section className="crm-card p-6 border-red-100 dark:border-red-950/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
              Privacy Architecture & Danger Zone
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              User data isolation and cache clearing
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600 leading-relaxed dark:bg-gray-800/40 dark:text-gray-300 mb-5">
          <strong>User Data Isolation:</strong> Your portfolio entries are isolated under your unique user ID (<code>{currentUser?.uid || 'guest'}</code>). Passwords and identities are managed by Firebase Authentication. Remember to download regular JSON backups.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
              Reset Account Portfolio
            </h4>
            <p className="text-xs text-gray-500">
              Permanently delete all stored portfolio entries for this account on this device
            </p>
          </div>
          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 size={15} /> Clear Portfolio Data
          </button>
        </div>
      </section>
    </div>
  )
}
