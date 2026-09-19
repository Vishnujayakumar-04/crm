import { useEffect, useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  LayoutDashboard,
  WalletCards,
  Landmark,
  PieChart as PieIcon,
  TrendingUp,
  Settings,
  User,
  Sun,
  Moon,
  LockKeyhole,
  LogOut,
  Plus,
  Search,
  Bell,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  Camera,
  Activity,
  Menu,
  X,
  UserCheck,
  Loader2
} from 'lucide-react'
import AuthGate from './components/AuthGate'
import HoldingsTab from './components/HoldingsTab'
import SavingsTab from './components/SavingsTab'
import AllocationTab from './components/AllocationTab'
import ReportsTab from './components/ReportsTab'
import ProfileTab from './components/ProfileTab'
import HoldingModal from './components/HoldingModal'
import SavingsModal from './components/SavingsModal'
import {
  fmtINR,
  getTheme,
  saveTheme,
  loadUserData,
  saveUserData,
  newId,
  createActivityRecord,
  getDaysRemaining
} from './utils/storage'
import {
  onAuthChange,
  logoutUser,
  isFirebaseConfigured,
  savePortfolioToFirestore,
  loadPortfolioFromFirestore,
  loadUserProfileFromFirestore,
  saveUserProfileToFirestore
} from './utils/firebase'

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'holdings', label: 'Shares & Funds', icon: WalletCards },
  { id: 'savings', label: 'Savings & FDs', icon: Landmark },
  { id: 'allocation', label: 'Allocation', icon: PieIcon },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
]

function initialTheme() {
  const stored = getTheme()
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [theme, setTheme] = useState(initialTheme)
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState(() => loadUserData(null))

  // Modals
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false)
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    saveTheme(theme)
  }, [theme])

  // Listen to Firebase authentication state & Firestore sync
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user)
      if (user) {
        // 1. Immediately render local cached portfolio
        const localPortfolio = loadUserData(user.uid)
        if (user.displayName && (!localPortfolio.profile?.name || localPortfolio.profile.name === 'Investor')) {
          localPortfolio.profile = { ...(localPortfolio.profile || {}), name: user.displayName }
        }
        setData(localPortfolio)

        // 2. Fetch extended profile (avatar, phone, gender, dob) from Firestore
        try {
          const cloudProfile = await loadUserProfileFromFirestore(user.uid)
          if (cloudProfile) {
            localPortfolio.profile = {
              ...(localPortfolio.profile || {}),
              name: cloudProfile.displayName || user.displayName || localPortfolio.profile?.name || 'Vishnu J',
              phone: cloudProfile.phone || localPortfolio.profile?.phone || '',
              gender: cloudProfile.gender || localPortfolio.profile?.gender || 'Male',
              dob: cloudProfile.dob || localPortfolio.profile?.dob || '',
              avatar: cloudProfile.avatar || localPortfolio.profile?.avatar || ''
            }
            setData({ ...localPortfolio })
          }
        } catch {}

        // 3. Asynchronously sync with Firestore cloud storage
        try {
          const cloudData = await loadPortfolioFromFirestore(user.uid)
          if (cloudData && (cloudData.holdings?.length > 0 || cloudData.savings?.length > 0)) {
            if (localPortfolio.holdings.length === 0 && localPortfolio.savings.length === 0) {
              setData(cloudData)
              saveUserData(user.uid, cloudData)
            }
          } else if (localPortfolio.holdings.length > 0 || localPortfolio.savings.length > 0) {
            savePortfolioToFirestore(user.uid, localPortfolio)
          }
        } catch {
          // Fallback to local cache if network is offline
        }
      } else {
        setData(loadUserData(null))
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Auto-save whenever data changes (local storage + Firestore cloud sync)
  useEffect(() => {
    if (!authLoading && currentUser) {
      saveUserData(currentUser.uid, data)
      savePortfolioToFirestore(currentUser.uid, data)
    }
  }, [data, currentUser, authLoading])

  // Calculate high-level financial summary
  const summary = useMemo(() => {
    const invested = data.holdings.reduce((sum, h) => sum + (h.qty || 0) * (h.buy || 0), 0)
    const current = data.holdings.reduce((sum, h) => sum + (h.qty || 0) * (h.current || 0), 0)
    const savings = data.savings.reduce((sum, s) => sum + (s.amount || 0), 0)
    const gain = current - invested
    const gainPercent = invested > 0 ? (gain / invested) * 100 : 0
    const netWorth = current + savings
    return { netWorth, invested, current, savings, gain, gainPercent }
  }, [data.holdings, data.savings])

  // Handlers for data manipulation
  function handleAddHolding(holding) {
    const activity = createActivityRecord('BUY', `Bought ${holding.name}`, `${holding.qty} units @ ${fmtINR(holding.buy)}`, holding.qty * holding.buy, 'Added', true)
    setData((curr) => ({
      ...curr,
      holdings: [holding, ...curr.holdings],
      activities: [activity, ...(curr.activities || [])].slice(0, 20)
    }))
  }

  function handleUpdateHoldingPrice(id, newPrice) {
    setData((curr) => {
      const item = curr.holdings.find((h) => h.id === id)
      const activity = item
        ? createActivityRecord('UPDATE', `Updated ${item.name}`, `New price ${fmtINR(newPrice)}`, (item.qty || 0) * newPrice, 'Updated', true)
        : null

      return {
        ...curr,
        holdings: curr.holdings.map((h) => h.id === id ? { ...h, current: newPrice } : h),
        activities: activity ? [activity, ...(curr.activities || [])].slice(0, 20) : curr.activities
      }
    })
  }

  function handleUpdateHolding(updated) {
    setData((curr) => ({
      ...curr,
      holdings: curr.holdings.map((h) => h.id === updated.id ? updated : h),
      activities: [
        createActivityRecord('UPDATE', `Edited ${updated.name}`, `Position modified`, updated.qty * updated.current, 'Updated', true),
        ...(curr.activities || [])
      ].slice(0, 20)
    }))
  }

  function handleDeleteHolding(id) {
    setData((curr) => {
      const item = curr.holdings.find((h) => h.id === id)
      const activity = item
        ? createActivityRecord('SELL', `Removed ${item.name}`, `${item.qty} units`, (item.qty || 0) * (item.current || 0), 'Deleted', false)
        : null

      return {
        ...curr,
        holdings: curr.holdings.filter((h) => h.id !== id),
        activities: activity ? [activity, ...(curr.activities || [])].slice(0, 20) : curr.activities
      }
    })
  }

  function handleAddSavings(saving) {
    const activity = createActivityRecord('SAVINGS', `Added ${saving.name}`, `${saving.type}${saving.interest ? ` (${saving.interest}% p.a.)` : ''}`, saving.amount, 'Added', true)
    setData((curr) => ({
      ...curr,
      savings: [saving, ...curr.savings],
      activities: [activity, ...(curr.activities || [])].slice(0, 20)
    }))
  }

  function handleUpdateSaving(updated) {
    setData((curr) => ({
      ...curr,
      savings: curr.savings.map((s) => s.id === updated.id ? updated : s),
      activities: [
        createActivityRecord('SAVINGS', `Edited ${updated.name}`, `${updated.type}`, updated.amount, 'Updated', true),
        ...(curr.activities || [])
      ].slice(0, 20)
    }))
  }

  function handleDeleteSavings(id) {
    setData((curr) => {
      const item = curr.savings.find((s) => s.id === id)
      const activity = item
        ? createActivityRecord('SAVINGS', `Closed ${item.name}`, `${item.type}`, item.amount, 'Closed', false)
        : null

      return {
        ...curr,
        savings: curr.savings.filter((s) => s.id !== id),
        activities: activity ? [activity, ...(curr.activities || [])].slice(0, 20) : curr.activities
      }
    })
  }

  function handleTakeSnapshot() {
    const now = new Date()
    const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const newSnapshot = {
      id: newId(),
      timestamp: Date.now(),
      date: dateLabel,
      netWorth: summary.netWorth,
      invested: summary.invested,
      current: summary.current,
      savings: summary.savings
    }
    setData((curr) => {
      const filteredHistory = (curr.history || []).filter((h) => h.date !== dateLabel)
      return {
        ...curr,
        history: [...filteredHistory, newSnapshot].slice(-30),
        activities: [
          createActivityRecord('SNAPSHOT', 'Portfolio Snapshot', `Captured Net Worth: ${fmtINR(summary.netWorth)}`, summary.netWorth, 'Saved', true),
          ...(curr.activities || [])
        ].slice(0, 20)
      }
    })
  }

  function handleUpdateProfile(newProfile) {
    setData((curr) => {
      const updatedProfile = { ...(curr.profile || {}), ...newProfile }
      if (currentUser?.uid) {
        saveUserProfileToFirestore(currentUser.uid, updatedProfile)
      }
      return {
        ...curr,
        profile: updatedProfile
      }
    })
  }

  async function handleLogout() {
    await logoutUser()
    setCurrentUser(null)
    setTab('dashboard')
  }

  // Initial Authentication Splash Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0d0f14] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 font-heading text-2xl font-extrabold text-white shadow-xl shadow-orange-500/30 animate-pulse">
            P<span className="text-amber-200">·</span>
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-gray-900 dark:text-white">
              Portfolio CRM
            </p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1.5">
              <Loader2 size={13} className="animate-spin text-orange-500" />
              <span>Verifying secure session...</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If user is not authenticated, display the redesigned AuthGate
  if (!currentUser) {
    return (
      <AuthGate
        onUnlock={(user) => setCurrentUser(user)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
    )
  }

  const userName = currentUser.displayName || data.profile?.name || currentUser.email?.split('@')[0] || 'Investor'
  const userInitials = (userName || 'U').slice(0, 2).toUpperCase()

  // Dynamic greeting based on current local hour
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0d0f14] text-[#0f172a] dark:text-[#f8fafc] flex flex-col md:flex-row">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR                                          */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#181b22] fixed inset-y-0 left-0 z-30">
        <div>
          {/* Logo Branding */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 font-heading text-lg font-extrabold text-white shadow-md shadow-orange-500/25">
              P<span className="text-amber-200">·</span>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
                Portfolio CRM
              </h1>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Private Wealth
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={19} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                  <span>{label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="space-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-2 dark:bg-gray-800/40">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Toggle light / dark mode"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-gray-600" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
              title="Sign out of your account"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* User Profile Mini Bar */}
          <div
            onClick={() => setTab('profile')}
            className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 font-heading font-bold text-xs text-white overflow-hidden">
              {data.profile?.avatar ? (
                <img src={data.profile.avatar} alt={userName} className="h-full w-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-xs text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {currentUser.email || 'Authenticated'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-8">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 md:px-8 backdrop-blur-md dark:border-gray-800/80 dark:bg-[#181b22]/90">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 font-heading font-bold text-sm text-white">
              P
            </div>
            <span className="font-heading font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
              Portfolio
            </span>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative w-72">
            <Search size={15} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets, FDs, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="crm-input pl-9 text-xs py-1.5"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Button with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="btn-primary text-xs py-2 px-3.5 sm:px-4"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">Add Asset</span>
                <ChevronDown size={13} className="opacity-75" />
              </button>

              {showAddMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-800 dark:bg-[#181b22] z-50"
                  onClick={() => setShowAddMenu(false)}
                >
                  <button
                    onClick={() => setIsHoldingModalOpen(true)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
                  >
                    <WalletCards size={15} />
                    <span>Shares &amp; Funds</span>
                  </button>
                  <button
                    onClick={() => setIsSavingsModalOpen(true)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
                  >
                    <Landmark size={15} />
                    <span>Savings or FD</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:text-red-600"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>

            {/* Desktop User Avatar */}
            <div
              onClick={() => setTab('profile')}
              className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-800 cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 font-heading font-bold text-xs text-white overflow-hidden">
                {data.profile?.avatar ? (
                  <img src={data.profile.avatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 md:p-8 max-w-[1560px] mx-auto w-full">
          {tab === 'dashboard' && (
            <DashboardOverview
              summary={summary}
              holdings={data.holdings}
              savings={data.savings}
              activities={data.activities || []}
              history={data.history || []}
              userName={userName}
              greeting={greeting}
              todayFormatted={todayFormatted}
              onAddHolding={() => setIsHoldingModalOpen(true)}
              onAddSavings={() => setIsSavingsModalOpen(true)}
              onTakeSnapshot={handleTakeSnapshot}
              onNavigate={setTab}
            />
          )}

          {tab === 'holdings' && (
            <HoldingsTab
              holdings={data.holdings}
              onAdd={handleAddHolding}
              onUpdatePrice={handleUpdateHoldingPrice}
              onUpdateHolding={handleUpdateHolding}
              onDelete={handleDeleteHolding}
            />
          )}

          {tab === 'savings' && (
            <SavingsTab
              savings={data.savings}
              onAdd={handleAddSavings}
              onUpdateSaving={handleUpdateSaving}
              onDelete={handleDeleteSavings}
            />
          )}

          {tab === 'allocation' && (
            <AllocationTab
              holdings={data.holdings}
              savings={data.savings}
            />
          )}

          {tab === 'reports' && (
            <ReportsTab
              holdings={data.holdings}
              savings={data.savings}
            />
          )}

          {(tab === 'profile' || tab === 'settings') && (
            <ProfileTab
              data={data}
              onUpdateData={setData}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
              currentUser={currentUser}
              theme={theme}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR                              */}
      {/* ========================================================= */}
      <nav className="md:hidden mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.slice(0, 5).map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          )
        })}
        <button
          onClick={() => setTab('profile')}
          className={`mobile-nav-item ${tab === 'profile' || tab === 'settings' ? 'active' : ''}`}
        >
          <User size={19} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Global Modals for Add Positions */}
      <HoldingModal
        isOpen={isHoldingModalOpen}
        onClose={() => setIsHoldingModalOpen(false)}
        onSave={handleAddHolding}
      />
      <SavingsModal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        onSave={handleAddSavings}
      />
    </div>
  )
}

/**
 * ====================================================================
 * DASHBOARD OVERVIEW COMPONENT (Desktop & Mobile Optimized)
 * ====================================================================
 */
function DashboardOverview({
  summary,
  holdings,
  savings,
  activities,
  history,
  userName,
  greeting,
  todayFormatted,
  onAddHolding,
  onAddSavings,
  onTakeSnapshot,
  onNavigate
}) {
  const [chartPeriod, setChartPeriod] = useState('ALL')
  const isPositive = summary.gain >= 0

  // Asset allocation categories for donut
  const allocation = useMemo(() => {
    const list = []
    const stockVal = holdings.filter((h) => h.type === 'Stock').reduce((s, h) => s + (h.qty * h.current), 0)
    const mfVal = holdings.filter((h) => h.type === 'Mutual Fund').reduce((s, h) => s + (h.qty * h.current), 0)
    const otherHoldingsVal = holdings.filter((h) => !['Stock', 'Mutual Fund'].includes(h.type)).reduce((s, h) => s + (h.qty * h.current), 0)
    const savingsVal = savings.reduce((s, item) => s + (item.amount || 0), 0)

    if (stockVal > 0) list.push({ name: 'Stocks', value: stockVal, color: '#f97316' })
    if (mfVal > 0) list.push({ name: 'Mutual Funds', value: mfVal, color: '#fb923c' })
    if (savingsVal > 0) list.push({ name: 'Savings & FDs', value: savingsVal, color: '#10b981' })
    if (otherHoldingsVal > 0) list.push({ name: 'Other Assets', value: otherHoldingsVal, color: '#64748b' })

    return list
  }, [holdings, savings])

  // Performance chart timeline: uses actual recorded snapshots or buy dates
  const timelineData = useMemo(() => {
    if (history && history.length >= 2) {
      return history.map((item) => ({
        label: item.date,
        value: item.netWorth,
        invested: item.invested
      }))
    }

    // Baseline fallback representing the user's current baseline portfolio
    return [
      { label: 'Start', value: summary.invested + summary.savings, invested: summary.invested },
      { label: 'Current', value: summary.netWorth, invested: summary.invested }
    ]
  }, [history, summary])

  // Upcoming FD Maturities (next 60 days)
  const upcomingMaturities = useMemo(() => {
    return savings
      .filter((s) => s.maturity)
      .map((s) => ({
        ...s,
        daysRemaining: getDaysRemaining(s.maturity)
      }))
      .sort((a, b) => (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999))
      .slice(0, 3)
  }, [savings])

  // Top positions preview
  const topHoldings = useMemo(() => {
    return [...holdings]
      .sort((a, b) => (b.qty * b.current) - (a.qty * a.current))
      .slice(0, 4)
  }, [holdings])

  return (
    <div className="space-y-6">
      {/* Top Greeting & Date Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {todayFormatted}
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-0.5">
            {greeting}, {userName} <span className="inline-block animate-pulse">👋</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Here is your live personal wealth and asset overview.
          </p>
        </div>

        {/* Snapshot / Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onTakeSnapshot}
            className="btn-secondary text-xs py-2 px-3"
            title="Save a historical snapshot of your net worth today"
          >
            <Camera size={14} />
            <span>Record Snapshot</span>
          </button>
          <button
            onClick={onAddHolding}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <Plus size={14} />
            <span>+ Position</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 1: HERO NET WORTH CARD + STAT CARDS                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Total Net Worth Hero Card */}
        <div className="crm-card-hero p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                Total Net Worth
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                INR (₹)
              </span>
            </div>
            <div className="mt-4">
              <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {fmtINR(summary.netWorth)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {isPositive ? '+' : ''}{fmtINR(summary.gain)} ({isPositive ? '+' : ''}{summary.gainPercent.toFixed(1)}%)
              </span>
              <span className="text-xs text-gray-400">all-time returns</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Invested Market</span>
              <strong className="font-heading font-bold text-white text-sm">{fmtINR(summary.invested)}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Liquid &amp; FDs</span>
              <strong className="font-heading font-bold text-white text-sm">{fmtINR(summary.savings)}</strong>
            </div>
            <button
              onClick={() => onNavigate('allocation')}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-semibold"
            >
              <span>View mix</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 3 Companion Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:col-span-7">
          <div className="crm-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="font-bold uppercase tracking-wider">Invested Capital</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  <WalletCards size={15} />
                </div>
              </div>
              <p className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white mt-3">
                {fmtINR(summary.invested)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <span>{holdings.length} active positions</span>
            </div>
          </div>

          <div className="crm-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="font-bold uppercase tracking-wider">Current Holdings</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <TrendingUp size={15} />
                </div>
              </div>
              <p className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white mt-3">
                {fmtINR(summary.current)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-500">Unrealized P&amp;L</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? '+' : ''}{fmtINR(summary.gain)}
              </span>
            </div>
          </div>

          <div className="crm-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="font-bold uppercase tracking-wider">Savings &amp; FDs</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Landmark size={15} />
                </div>
              </div>
              <p className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white mt-3">
                {fmtINR(summary.savings)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <span>{savings.length} accounts &amp; deposits</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 2: PERFORMANCE CHART + ASSET ALLOCATION DONUT         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Performance Chart Card */}
        <section className="crm-card p-6 lg:col-span-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                Portfolio Performance
              </h3>
              <p className="text-xs text-gray-400">
                {history.length >= 2 ? 'Net worth progression over time' : 'Current portfolio baseline (Record daily snapshots to track trend)'}
              </p>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 self-start sm:self-auto">
              {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    chartPeriod === period
                      ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="orangeTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#888' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value) => [fmtINR(value), 'Portfolio Value']}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#orangeTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Asset Allocation Donut Card */}
        <section className="crm-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                Asset Allocation
              </h3>
              <p className="text-xs text-gray-400">Total distribution</p>
            </div>
            <button
              onClick={() => onNavigate('allocation')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="flex items-center justify-center my-auto py-2">
            <div className="relative h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation.length ? allocation : [{ name: 'Empty', value: 1, color: '#e5e7eb' }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {(allocation.length ? allocation : [{ color: '#e5e7eb' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white">
                  {fmtINR(summary.netWorth, { compact: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            {allocation.map((item) => {
              const pct = summary.netWorth > 0 ? (item.value / summary.netWorth) * 100 : 0
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong className="font-heading text-gray-900 dark:text-white">{fmtINR(item.value)}</strong>
                    <span className="text-gray-400 text-[11px]">({pct.toFixed(0)}%)</span>
                  </div>
                </div>
              )
            })}
            {allocation.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-2">Add assets to see allocation</p>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================= */}
      {/* ROW 3: TOP HOLDINGS + UPCOMING MATURITIES + RECENT LOG    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Holdings Widget */}
        <section className="crm-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-white">
              Top Holdings
            </h3>
            <button
              onClick={() => onNavigate('holdings')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              View all ({holdings.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {topHoldings.map((h) => {
              const val = h.qty * h.current
              const invested = h.qty * h.buy
              const pnl = val - invested
              const pos = pnl >= 0

              return (
                <div key={h.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800/40 text-xs">
                  <div>
                    <strong className="font-heading font-bold text-gray-900 dark:text-white block">
                      {h.name}
                    </strong>
                    <span className="text-[10px] text-gray-400">{h.qty} units · {h.type}</span>
                  </div>
                  <div className="text-right">
                    <strong className="font-heading font-bold text-gray-900 dark:text-white block">
                      {fmtINR(val)}
                    </strong>
                    <span className={`font-semibold text-[11px] ${pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {pos ? '+' : ''}{fmtINR(pnl)}
                    </span>
                  </div>
                </div>
              )
            })}
            {topHoldings.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">No holdings yet</p>
            )}
          </div>
        </section>

        {/* Upcoming FD Maturities Widget */}
        <section className="crm-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-white">
              Upcoming Maturities
            </h3>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              View FDs
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingMaturities.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800/40 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                    <Clock size={15} />
                  </div>
                  <div>
                    <strong className="font-heading font-bold text-gray-900 dark:text-white block">
                      {item.name}
                    </strong>
                    <span className="text-[10px] text-gray-400">{fmtINR(item.amount)}</span>
                  </div>
                </div>
                <div>
                  {item.daysRemaining !== null ? (
                    <span className={item.daysRemaining <= 30 ? (item.daysRemaining < 0 ? 'badge-red' : 'badge-orange') : 'badge-neutral'}>
                      {item.daysRemaining < 0 ? 'Matured' : `${item.daysRemaining}d left`}
                    </span>
                  ) : (
                    <span className="badge-neutral">Active</span>
                  )}
                </div>
              </div>
            ))}
            {upcomingMaturities.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">No upcoming maturities scheduled</p>
            )}
          </div>
        </section>

        {/* Real Activity & Transaction Feed */}
        <section className="crm-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <span className="text-xs text-gray-400">Audit trail</span>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-none last:pb-0 dark:border-gray-800 text-xs">
                <div>
                  <strong className="font-heading font-bold text-gray-900 dark:text-white block">
                    {act.title}
                  </strong>
                  <span className="text-[10px] text-gray-400">{act.subtitle}</span>
                </div>
                <div className="text-right">
                  <span className={act.positive ? 'badge-green text-[10px]' : 'badge-neutral text-[10px]'}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">Activity log will record your actions</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}