const KEYS = {
  password: 'portfolio-crm-password',
  data: 'portfolio-crm-data',
  theme: 'portfolio-crm-theme'
}

export const holdingTypes = ['Stock', 'Mutual Fund', 'ETF', 'Gold', 'Crypto', 'Other']
export const savingTypes = ['Savings Account', 'Fixed Deposit', 'Recurring Deposit', 'PPF', 'Other']

export const defaultExpenseCategories = [
  'Food',
  'Rent',
  'Travel',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Entertainment',
  'Personal',
  'Family',
  'EMI / Loans',
  'Other'
]

export const defaultIncomeCategories = [
  'Salary',
  'Freelance',
  'Interest',
  'Dividend',
  'Bonus',
  'Other'
]

export const paymentMethods = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
]

export const categoryColors = {
  Food: '#f97316',
  Rent: '#ef4444',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Healthcare: '#10b981',
  Education: '#8b5cf6',
  Entertainment: '#06b6d4',
  Personal: '#f59e0b',
  Family: '#14b8a6',
  'EMI / Loans': '#6366f1',
  Other: '#64748b'
}

export const initialProfile = {
  name: 'Vishnu J',
  phone: '',
  gender: '',
  dob: '',
  avatar: '',
  currency: 'INR',
  tagline: 'Private Wealth Tracker'
}

const emptyData = {
  holdings: [],
  savings: [],
  expenses: [],
  income: [],
  activities: [],
  history: [],
  profile: initialProfile
}

export function getDataKey(userId) {
  return userId ? `portfolio-crm-data-${userId}` : KEYS.data
}

export function getPasswordHash() {
  return localStorage.getItem(KEYS.password)
}

export function savePasswordHash(hash) {
  localStorage.setItem(KEYS.password, hash)
}

export function clearAllData(userId) {
  if (userId) {
    localStorage.removeItem(getDataKey(userId))
  }
  localStorage.removeItem(KEYS.data)
  localStorage.removeItem(KEYS.password)
  sessionStorage.clear()
}

/**
 * Loads portfolio data isolated for a specific user ID
 * Safely migrates existing un-scoped data on first login so no records are lost
 */
export function loadUserData(userId) {
  const key = getDataKey(userId)
  try {
    let raw = localStorage.getItem(key)
    // If user key is empty and we have a userId, check legacy global key to migrate data
    if (!raw && userId) {
      const legacyRaw = localStorage.getItem(KEYS.data)
      if (legacyRaw) {
        raw = legacyRaw
        try {
          localStorage.setItem(key, legacyRaw)
        } catch {
          // ignore quota issues
        }
      }
    }
    if (!raw) return emptyData
    const parsed = JSON.parse(raw)
    return {
      holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
      savings: Array.isArray(parsed.savings) ? parsed.savings : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      income: Array.isArray(parsed.income) ? parsed.income : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      profile: parsed.profile && typeof parsed.profile === 'object' ? { ...initialProfile, ...parsed.profile } : initialProfile
    }
  } catch {
    return emptyData
  }
}

/**
 * Saves portfolio data isolated for a specific user ID
 */
export function saveUserData(userId, data) {
  const key = getDataKey(userId)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save data to localStorage', err)
  }
}

// Backward-compatible wrappers
export function loadData() {
  return loadUserData(null)
}

export function saveData(data) {
  saveUserData(null, data)
}

export function getTheme() {
  return localStorage.getItem(KEYS.theme)
}

export function saveTheme(theme) {
  localStorage.setItem(KEYS.theme, theme)
}

export function fmtINR(value, options = {}) {
  const num = Number(value || 0)
  if (options.compact) {
    const abs = Math.abs(num)
    if (abs >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`
    if (abs >= 100000) return `₹${(num / 100000).toFixed(2)} L`
    if (abs >= 1000) return `₹${(num / 1000).toFixed(1)} K`
  }
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 2
  })}`
}

export const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

/**
 * Calculates maturity value for fixed deposits based on compound interest (quarterly compounding)
 */
export function calculateMaturity(principal, rate, startDate, maturityDate) {
  const p = Number(principal || 0)
  const r = Number(rate || 0)
  if (!p || !r || !startDate || !maturityDate) return p

  const start = new Date(startDate).getTime()
  const end = new Date(maturityDate).getTime()
  if (isNaN(start) || isNaN(end) || end <= start) return p

  const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25)
  // Standard Indian quarterly compounding: A = P * (1 + r / 400)^(4 * t)
  const maturity = p * Math.pow(1 + r / 400, 4 * years)
  return Math.round(maturity)
}

/**
 * Returns number of days remaining until maturity
 */
export function getDaysRemaining(maturityDate) {
  if (!maturityDate) return null
  const target = new Date(maturityDate)
  if (isNaN(target.getTime())) return null
  const now = new Date()
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.ceil((targetDay - nowDay) / (1000 * 60 * 60 * 24))
}

/**
 * Records an activity into the activities log
 */
export function createActivityRecord(type, title, subtitle, amount = 0, status = 'Added', positive = true) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return {
    id: newId(),
    type,
    title,
    subtitle: `${dateStr}, ${timeStr}`,
    amount: Number(amount || 0),
    status,
    positive
  }
}

/**
 * Export portfolio data as a JSON file
 */
export function exportDataAsJSON(data) {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `portfolio-crm-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Parses and validates an imported JSON backup
 */
export function parseImportedJSON(jsonString) {
  const parsed = JSON.parse(jsonString)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON data format')
  }
  return {
    holdings: Array.isArray(parsed.holdings) ? parsed.holdings : [],
    savings: Array.isArray(parsed.savings) ? parsed.savings : [],
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    income: Array.isArray(parsed.income) ? parsed.income : [],
    activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    history: Array.isArray(parsed.history) ? parsed.history : [],
    profile: parsed.profile && typeof parsed.profile === 'object' ? { ...initialProfile, ...parsed.profile } : initialProfile
  }
}

/**
 * Calculates start and end timestamps for a given financial period filter
 */
export function getDateRangeForPeriod(period = 'This Month', customRange = {}) {
  const now = new Date()
  let start = new Date()
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  switch (period) {
    case 'this-month':
    case 'This Month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last-month':
    case 'Last Month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      break
    case '3-months':
    case '3 Months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      break
    case '6-months':
    case '6 Months':
      start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      break
    case 'this-year':
    case 'This Year':
      start = new Date(now.getFullYear(), 0, 1)
      break
    case 'custom':
    case 'Custom Range':
      if (customRange.start) start = new Date(customRange.start)
      if (customRange.end) end = new Date(customRange.end + 'T23:59:59')
      break
    case 'all':
    default:
      start = new Date(2000, 0, 1)
      break
  }
  return { start, end }
}

/**
 * Filter items by their date property against a chosen period
 */
export function filterByPeriod(items = [], period = 'This Month', customRange = {}) {
  const { start, end } = getDateRangeForPeriod(period, customRange)
  return items.filter((item) => {
    if (!item.date) return false
    const itemDate = new Date(item.date)
    return itemDate >= start && itemDate <= end
  })
}

/**
 * Computes Cash Flow Summary (Income, Expenses, Remaining Balance, Savings Rate)
 */
export function computeCashFlowSummary(income = [], expenses = [], period = 'This Month', customRange = {}) {
  const filteredIncome = filterByPeriod(income, period, customRange)
  const filteredExpenses = filterByPeriod(expenses, period, customRange)

  const totalIncome = filteredIncome.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
  const totalExpenses = filteredExpenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
  const remainingBalance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.max(0, (remainingBalance / totalIncome) * 100) : 0

  return {
    totalIncome,
    totalExpenses,
    remainingBalance,
    savingsRate,
    filteredIncome,
    filteredExpenses
  }
}