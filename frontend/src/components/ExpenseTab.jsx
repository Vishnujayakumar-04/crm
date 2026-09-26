import { useState, useMemo } from 'react'
import {
  Receipt,
  Plus,
  TrendingUp,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit2,
  PieChart as PieIcon,
  BarChart3,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Layers,
  FileSpreadsheet
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'
import {
  fmtINR,
  categoryColors,
  defaultExpenseCategories,
  defaultIncomeCategories,
  paymentMethods,
  getDateRangeForPeriod,
  filterByPeriod,
  computeCashFlowSummary
} from '../utils/storage'
import ExpenseModal from './ExpenseModal'
import IncomeModal from './IncomeModal'

const PERIOD_OPTIONS = [
  'This Month',
  'Last Month',
  '3 Months',
  '6 Months',
  'This Year',
  'Custom Range'
]

const PALETTE = [
  '#f97316', '#ef4444', '#3b82f6', '#ec4899', '#eab308',
  '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#14b8a6',
  '#6366f1', '#64748b'
]

export default function ExpenseTab({
  expenses = [],
  income = [],
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')
  const [customRange, setCustomRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // List view mode: 'expenses' or 'income'
  const [activeListView, setActiveListView] = useState('expenses')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL')
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('date-desc')

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)

  // Cash flow summary calculations based on selected period
  const cashFlow = useMemo(() => {
    return computeCashFlowSummary(income, expenses, selectedPeriod, customRange)
  }, [income, expenses, selectedPeriod, customRange])

  // Filtered expenses for selected period and search criteria
  const displayedExpenses = useMemo(() => {
    let list = cashFlow.filteredExpenses

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q)
      )
    }

    if (selectedCategoryFilter !== 'ALL') {
      list = list.filter((e) => e.category === selectedCategoryFilter)
    }

    if (selectedPaymentFilter !== 'ALL') {
      list = list.filter((e) => e.paymentMethod === selectedPaymentFilter)
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0)
      if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0)
      return 0
    })
  }, [cashFlow.filteredExpenses, searchQuery, selectedCategoryFilter, selectedPaymentFilter, sortBy])

  // Filtered income list for selected period and search criteria
  const displayedIncome = useMemo(() => {
    let list = cashFlow.filteredIncome

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (inc) =>
          inc.description?.toLowerCase().includes(q) ||
          inc.category?.toLowerCase().includes(q) ||
          inc.notes?.toLowerCase().includes(q)
      )
    }

    if (selectedCategoryFilter !== 'ALL') {
      list = list.filter((inc) => inc.category === selectedCategoryFilter)
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0)
      if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0)
      return 0
    })
  }, [cashFlow.filteredIncome, searchQuery, selectedCategoryFilter, sortBy])

  // 1. Spending by Category (Donut Chart)
  const categoryChartData = useMemo(() => {
    const map = {}
    cashFlow.filteredExpenses.forEach((item) => {
      const cat = item.category || 'Other'
      map[cat] = (map[cat] || 0) + (Number(item.amount) || 0)
    })

    return Object.entries(map)
      .map(([name, value], idx) => ({
        name,
        value,
        color: categoryColors[name] || PALETTE[idx % PALETTE.length]
      }))
      .sort((a, b) => b.value - a.value)
  }, [cashFlow.filteredExpenses])

  // 2. Monthly Spending (Bar Chart)
  const monthlyBarData = useMemo(() => {
    const monthsMap = {}
    const monthsOrder = []

    // Look back at the last 6 months of historical expenses
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      monthsOrder.push(key)
      monthsMap[key] = { month: key, expenses: 0, income: 0 }
    }

    expenses.forEach((item) => {
      if (!item.date) return
      const d = new Date(item.date)
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (monthsMap[key]) {
        monthsMap[key].expenses += Number(item.amount) || 0
      }
    })

    income.forEach((item) => {
      if (!item.date) return
      const d = new Date(item.date)
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (monthsMap[key]) {
        monthsMap[key].income += Number(item.amount) || 0
      }
    })

    return monthsOrder.map((key) => monthsMap[key])
  }, [expenses, income])

  // 3. Spending Trend (Daily / Periodic Area Chart)
  const spendingTrendData = useMemo(() => {
    if (cashFlow.filteredExpenses.length === 0) return []

    const dailyMap = {}
    cashFlow.filteredExpenses.forEach((item) => {
      const dateKey = item.date
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + (Number(item.amount) || 0)
    })

    const sortedDates = Object.keys(dailyMap).sort()
    let cumulative = 0

    return sortedDates.map((dateKey) => {
      cumulative += dailyMap[dateKey]
      const formattedDate = new Date(dateKey).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      return {
        date: formattedDate,
        amount: dailyMap[dateKey],
        cumulative
      }
    })
  }, [cashFlow.filteredExpenses])

  function handleEditExpenseClick(expense) {
    setEditingExpense(expense)
    setIsExpenseModalOpen(true)
  }

  function handleDeleteExpenseClick(id, description, amount) {
    if (
      window.confirm(
        `Are you sure you want to delete this expense of ${fmtINR(amount)} (${description || 'Expense'})?`
      )
    ) {
      onDeleteExpense(id)
    }
  }

  function handleEditIncomeClick(item) {
    setEditingIncome(item)
    setIsIncomeModalOpen(true)
  }

  function handleDeleteIncomeClick(id, description, amount) {
    if (
      window.confirm(
        `Are you sure you want to delete this income record of ${fmtINR(amount)} (${description || 'Income'})?`
      )
    ) {
      onDeleteIncome(id)
    }
  }

  const isNetPositive = cashFlow.remainingBalance >= 0

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & ACTION BUTTONS                            */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Expenses &amp; Cash Flow
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Receipt size={12} />
              <span>Personal Finance</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track daily living expenses, income streams, and monthly savings discipline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingIncome(null)
              setIsIncomeModalOpen(true)
            }}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Log salary, bonus, freelance, or dividend income"
          >
            <TrendingUp size={14} className="text-emerald-500" />
            <span>+ Add Income</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null)
              setIsExpenseModalOpen(true)
            }}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            title="Record a new expense"
          >
            <Plus size={14} />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PERIOD SELECTOR TOOLBAR                                */}
      {/* ========================================================= */}
      <div className="crm-card p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
          <Calendar size={15} className="text-orange-500" />
          <span className="uppercase tracking-wider">Analysis Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PERIOD_OPTIONS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedPeriod === period
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Custom Range Date Pickers */}
        {selectedPeriod === 'Custom Range' && (
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 animate-in fade-in duration-150">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
              className="crm-input text-xs py-1 px-2.5 w-auto"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
              className="crm-input text-xs py-1 px-2.5 w-auto"
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. FOUR TOP SUMMARY METRIC CARDS                          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Period Income */}
        <div className="crm-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Period Income
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-3">
              {fmtINR(cashFlow.totalIncome)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>{cashFlow.filteredIncome.length} credits</span>
            <span className="text-[11px] text-gray-400">{selectedPeriod}</span>
          </div>
        </div>

        {/* Card 2: Total Period Expenses */}
        <div className="crm-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Expenses
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <CreditCard size={16} />
              </div>
            </div>
            <p className="font-heading font-extrabold text-2xl text-red-600 dark:text-red-400 mt-3">
              {fmtINR(cashFlow.totalExpenses)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>{cashFlow.filteredExpenses.length} transactions</span>
            <span className="text-[11px] text-gray-400">{selectedPeriod}</span>
          </div>
        </div>

        {/* Card 3: Remaining Balance / Net Cash Flow */}
        <div className="crm-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Remaining Balance
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  isNetPositive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                }`}
              >
                {isNetPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <p
              className={`font-heading font-extrabold text-2xl mt-3 ${
                isNetPositive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {fmtINR(cashFlow.remainingBalance)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {isNetPositive ? 'Surplus Cash' : 'Deficit / Over budget'}
            </span>
            <span className="text-[11px] text-gray-400">Net Flow</span>
          </div>
        </div>

        {/* Card 4: Savings Rate */}
        <div className="crm-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Savings Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <p className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white">
                {cashFlow.savingsRate.toFixed(1)}%
              </p>
              <span className="text-xs font-semibold text-gray-400">of income</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, cashFlow.savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. EXPENSE ANALYTICS CHARTS (RECHARTS)                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Spending by Category (Donut) */}
        <div className="crm-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <PieIcon size={16} className="text-orange-500" />
                <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">
                  Spending by Category
                </h3>
              </div>
              <span className="text-xs text-gray-400">{selectedPeriod}</span>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => fmtINR(val)}
                      contentStyle={{
                        backgroundColor: '#181b22',
                        borderColor: '#262b35',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#ffffff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                  <CreditCard size={22} />
                </div>
                <p className="font-heading font-bold text-sm text-gray-700 dark:text-gray-300">
                  No expenses recorded yet
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Track your spending to understand where your money goes.
                </p>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="btn-primary py-1.5 px-3.5 text-xs font-bold mt-4"
                >
                  + Add Expense
                </button>
              </div>
            )}
          </div>

          {/* Category Chips Breakdown */}
          {categoryChartData.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs">
              {categoryChartData.slice(0, 6).map((cat) => {
                const pct = cashFlow.totalExpenses > 0 ? (cat.value / cashFlow.totalExpenses) * 100 : 0
                return (
                  <div key={cat.name} className="flex items-center justify-between pr-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-600 dark:text-gray-300 truncate font-medium">{cat.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white ml-1">{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chart B & C: Monthly Spending & Trend (Tabs/Dual View) */}
        <div className="crm-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-orange-500" />
                <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">
                  Monthly Cash Flow Trends (Last 6 Months)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
                </span>
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Expenses
                </span>
              </div>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                  />
                  <Tooltip
                    formatter={(val) => fmtINR(val)}
                    contentStyle={{
                      backgroundColor: '#181b22',
                      borderColor: '#262b35',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Comparing total inflows against outflows</span>
            <span className="text-orange-500 font-semibold">6-Month History</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. TRANSACTION LIST, SEARCH, AND FILTERS                  */}
      {/* ========================================================= */}
      <section className="crm-card p-6">
        {/* Section Header with List View Switcher (Expenses vs Income) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
          <div className="flex items-center gap-3">
            {/* View Switcher Pills */}
            <div className="flex items-center rounded-2xl bg-gray-100 p-1 dark:bg-gray-800/80">
              <button
                type="button"
                onClick={() => setActiveListView('expenses')}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  activeListView === 'expenses'
                    ? 'bg-white text-orange-600 shadow-sm dark:bg-[#181b22] dark:text-orange-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <CreditCard size={14} />
                <span>Expenses ({cashFlow.filteredExpenses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveListView('income')}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  activeListView === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-[#181b22] dark:text-emerald-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <TrendingUp size={14} />
                <span>Income ({cashFlow.filteredIncome.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Action Button for current active list view */}
          <div className="flex items-center gap-2">
            {activeListView === 'expenses' ? (
              <button
                onClick={() => {
                  setEditingExpense(null)
                  setIsExpenseModalOpen(true)
                }}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Expense</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingIncome(null)
                  setIsIncomeModalOpen(true)
                }}
                className="btn-primary py-2 px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Income</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {/* Search Input */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeListView}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="crm-input pl-9 text-xs py-2"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="crm-input pl-9 text-xs py-2 font-medium"
            >
              <option value="ALL">All Categories</option>
              {activeListView === 'expenses'
                ? defaultExpenseCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                : defaultIncomeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
            </select>
          </div>

          {/* Payment Method Filter (only for expenses) */}
          {activeListView === 'expenses' ? (
            <div className="relative">
              <Wallet size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="crm-input pl-9 text-xs py-2 font-medium"
              >
                <option value="ALL">All Payment Methods</option>
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="crm-input text-xs py-2 font-medium"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. TRANSACTIONS TABLE (DESKTOP) & CARDS (MOBILE)          */}
        {/* ========================================================= */}
        {activeListView === 'expenses' ? (
          displayedExpenses.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Payment Method</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {displayedExpenses.map((expense) => {
                      const color = categoryColors[expense.category] || '#64748b'
                      return (
                        <tr
                          key={expense.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                        >
                          <td className="py-3 px-3 whitespace-nowrap text-gray-600 dark:text-gray-300 font-medium">
                            {expense.date}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{
                                backgroundColor: `${color}15`,
                                color: color
                              }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                              <span>{expense.category}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium max-w-xs truncate">
                            {expense.description || <span className="text-gray-400 italic">No description</span>}
                            {expense.notes && (
                              <span className="block text-[11px] text-gray-400 truncate mt-0.5">
                                {expense.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-gray-500 dark:text-gray-400 font-medium">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px]">
                              {expense.paymentMethod || 'UPI'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap font-heading font-extrabold text-sm text-red-600 dark:text-red-400">
                            -{fmtINR(expense.amount)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditExpenseClick(expense)}
                                className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                                title="Edit expense"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteExpenseClick(expense.id, expense.description, expense.amount)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Delete expense"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3">
                {displayedExpenses.map((expense) => {
                  const color = categoryColors[expense.category] || '#64748b'
                  return (
                    <div
                      key={expense.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor: `${color}15`, color: color }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <span>{expense.category}</span>
                          </span>
                          <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white mt-1">
                            {expense.description || expense.category}
                          </h4>
                        </div>
                        <span className="font-heading font-extrabold text-sm text-red-600 dark:text-red-400">
                          -{fmtINR(expense.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <span>{expense.date} • {expense.paymentMethod || 'UPI'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditExpenseClick(expense)}
                            className="p-1 text-gray-500 hover:text-orange-500"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpenseClick(expense.id, expense.description, expense.amount)}
                            className="p-1 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                <Receipt size={22} />
              </div>
              <p className="font-heading font-bold text-sm text-gray-700 dark:text-gray-300">
                No expenses recorded yet
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Track your spending to understand where your money goes.
              </p>
              <button
                onClick={() => {
                  setEditingExpense(null)
                  setIsExpenseModalOpen(true)
                }}
                className="btn-primary py-2 px-4 text-xs font-bold mt-4"
              >
                + Add Expense
              </button>
            </div>
          )
        ) : displayedIncome.length > 0 ? (
          <>
            {/* Desktop Income Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {displayedIncome.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3 whitespace-nowrap text-gray-600 dark:text-gray-300 font-medium">
                        {inc.date}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{inc.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-900 dark:text-white font-medium max-w-xs truncate">
                        {inc.description || <span className="text-gray-400 italic">No description</span>}
                        {inc.notes && (
                          <span className="block text-[11px] text-gray-400 truncate mt-0.5">
                            {inc.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap font-heading font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        +{fmtINR(inc.amount)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditIncomeClick(inc)}
                            className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                            title="Edit income"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteIncomeClick(inc.id, inc.description, inc.amount)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete income"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Income Cards View */}
            <div className="md:hidden space-y-3">
              {displayedIncome.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{inc.category}</span>
                      </span>
                      <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white mt-1">
                        {inc.description || inc.category}
                      </h4>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      +{fmtINR(inc.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span>{inc.date}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditIncomeClick(inc)}
                        className="p-1 text-gray-500 hover:text-emerald-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteIncomeClick(inc.id, inc.description, inc.amount)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
              <TrendingUp size={22} />
            </div>
            <p className="font-heading font-bold text-sm text-gray-700 dark:text-gray-300">
              No income records yet
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Log salary, consulting, dividends, or interest to track your savings rate.
            </p>
            <button
              onClick={() => {
                setEditingIncome(null)
                setIsIncomeModalOpen(true)
              }}
              className="btn-primary py-2 px-4 text-xs font-bold mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              + Add Income
            </button>
          </div>
        )}
      </section>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false)
          setEditingExpense(null)
        }}
        onSave={(item) => {
          if (editingExpense) {
            onUpdateExpense(item)
          } else {
            onAddExpense(item)
          }
        }}
        initialData={editingExpense}
      />

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false)
          setEditingIncome(null)
        }}
        onSave={(item) => {
          if (editingIncome) {
            onUpdateIncome(item)
          } else {
            onAddIncome(item)
          }
        }}
        initialData={editingIncome}
      />
    </div>
  )
}
