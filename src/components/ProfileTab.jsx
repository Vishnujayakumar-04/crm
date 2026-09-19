import { useState, useRef, useEffect } from 'react'
import {
  User,
  Shield,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Camera,
  MoreVertical,
  Sun,
  Moon,
  Cloud,
  Check,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import {
  exportDataAsJSON,
  parseImportedJSON,
  clearAllData
} from '../utils/storage'
import { sendPasswordReset, formatAuthError } from '../utils/firebase'

export default function ProfileTab({
  data,
  onUpdateData,
  onUpdateProfile,
  onLogout,
  currentUser,
  theme,
  onToggleTheme
}) {
  const [name, setName] = useState(data.profile?.name || currentUser?.displayName || 'Vishnu J')
  const [phone, setPhone] = useState(data.profile?.phone || '')
  const [gender, setGender] = useState(data.profile?.gender || 'Male')
  const [dob, setDob] = useState(data.profile?.dob || '')
  const [avatar, setAvatar] = useState(data.profile?.avatar || '')
  const [profileSaved, setProfileSaved] = useState(false)

  // 3-dot dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Password reset email state
  const [resetSending, setResetSending] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')

  // Import state
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const importInputRef = useRef(null)

  // Close 3-dot menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 180
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        const optimized = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(optimized)
        onUpdateProfile({ avatar: optimized })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveAvatar() {
    setAvatar('')
    onUpdateProfile({ avatar: '' })
  }

  function handleSaveProfile(e) {
    e.preventDefault()
    onUpdateProfile({
      name: name.trim() || 'Vishnu J',
      phone: phone.trim(),
      gender,
      dob,
      avatar
    })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  async function handleSendResetEmail() {
    setIsMenuOpen(false)
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

  function handleExportBackup() {
    setIsMenuOpen(false)
    exportDataAsJSON(data)
  }

  function handleTriggerImport() {
    setIsMenuOpen(false)
    if (importInputRef.current) {
      importInputRef.current.click()
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
    setIsMenuOpen(false)
    if (window.confirm('CAUTION: This will permanently delete all portfolio positions, savings records, and cached data for this account from this browser.\n\nAre you sure you want to reset everything?')) {
      clearAllData(currentUser?.uid)
      window.location.reload()
    }
  }

  const userInitials = (name || currentUser?.displayName || currentUser?.email || 'V')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Hidden file input for backup restore */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileImport}
      />

      {/* Notifications / Alerts */}
      {resetMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}
      {resetError && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{resetError}</span>
        </div>
      )}
      {importSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{importSuccess}</span>
        </div>
      )}
      {importError && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HERO USER PROFILE CARD (WITH 3-DOT MENU)              */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#181b22] border border-gray-200/80 dark:border-gray-800 shadow-sm">
        {/* Subtle Decorative Ambient Gradient */}
        <div className="h-28 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="absolute right-6 top-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white text-[11px] font-semibold">
              <Cloud size={12} className="text-emerald-300" />
              <span>Cloud Synced</span>
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
            {/* Avatar with Camera Trigger */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-3xl bg-white dark:bg-[#181b22] p-1.5 shadow-xl">
                  <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-heading font-extrabold text-2xl text-white">
                        {userInitials}
                      </span>
                    )}
                  </div>
                </div>

                <label
                  htmlFor="profile-avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all active:scale-95"
                  title="Change profile picture"
                >
                  <Camera size={15} />
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {name}
                  </h1>
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" title="Verified Account">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {currentUser?.email || 'investor@portfoliocrm.com'}
                </p>
              </div>
            </div>

            {/* Top-Right: 3-Dot Menu Button */}
            <div className="relative self-end sm:self-auto" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700/80 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-all active:scale-95"
                title="Account Settings &amp; Actions"
                aria-label="Account Settings Menu"
              >
                <MoreVertical size={18} />
              </button>

              {/* 3-Dot Dropdown Menu Popover */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl p-1.5 shadow-2xl dark:border-gray-700/80 dark:bg-[#181b22]/95 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    Account Actions
                  </div>

                  {/* Password Reset */}
                  <button
                    onClick={handleSendResetEmail}
                    disabled={resetSending}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 transition-colors"
                  >
                    <KeyRound size={15} />
                    <span>Reset Password</span>
                  </button>

                  {/* Export Portfolio Backup */}
                  <button
                    onClick={handleExportBackup}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 transition-colors"
                  >
                    <Download size={15} />
                    <span>Export Backup (JSON)</span>
                  </button>

                  {/* Import Portfolio Backup */}
                  <button
                    onClick={handleTriggerImport}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 transition-colors"
                  >
                    <Upload size={15} />
                    <span>Import Backup (JSON)</span>
                  </button>

                  {/* Theme Toggle */}
                  {onToggleTheme && (
                    <button
                      onClick={() => { setIsMenuOpen(false); onToggleTheme(); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 transition-colors"
                    >
                      {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                      <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                  {/* Reset All Local Data */}
                  <button
                    onClick={handleResetAll}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 size={15} />
                    <span>Clear Local Data</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={() => { setIsMenuOpen(false); onLogout(); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {phone ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <Phone size={13} className="text-gray-400" />
                <span>{phone}</span>
              </span>
            ) : null}

            {gender ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <User size={13} className="text-gray-400" />
                <span>{gender}</span>
              </span>
            ) : null}

            {dob ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs text-gray-700 dark:text-gray-300 font-medium">
                <Calendar size={13} className="text-gray-400" />
                <span>Born {dob}</span>
              </span>
            ) : null}

            {avatar ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs text-red-500 hover:underline font-semibold ml-auto"
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PERSONAL INFORMATION FORM (NEAT & CLEAN)               */}
      {/* ========================================================= */}
      <section className="crm-card p-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
              Personal Information
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update your profile credentials and personal contact details
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg">
            <Sparkles size={12} />
            <span>Profile Details</span>
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  className="crm-input pl-11 text-sm font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vishnu J"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  className="crm-input pl-11 text-sm font-medium"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  className="crm-input pl-11 text-sm font-medium"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            {/* Gender Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      gender === g
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
                        : 'bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button type="submit" className="btn-primary py-2.5 px-5 text-xs font-bold">
              Save Profile Changes
            </button>
            {profileSaved && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                <CheckCircle2 size={14} />
                <span>Profile updated successfully</span>
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ========================================================= */}
      {/* 3. ACCOUNT & SECURITY OVERVIEW                            */}
      {/* ========================================================= */}
      <section className="crm-card p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
              Account Security &amp; Sync
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Firebase Authentication and Cloud Firestore status
            </p>
          </div>
          <Shield size={18} className="text-orange-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Registered Email
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {currentUser?.email || 'N/A'}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Identity Verified</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Cross-Device Cloud Sync
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              Google Cloud Firestore
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Document: users/{currentUser?.uid?.slice(0, 10)}...
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
