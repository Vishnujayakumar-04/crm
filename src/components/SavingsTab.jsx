import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  ArrowUpDown,
  Landmark,
  Clock,
  Percent,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  fmtINR,
  savingTypes,
  calculateMaturity,
  getDaysRemaining
} from '../utils/storage'
import SavingsModal from './SavingsModal'

export default function SavingsTab({ savings = [], onAdd, onUpdateSaving, onDelete }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('amount-desc')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // Filter and sort
  const filteredSavings = useMemo(() => {
    let list = [...savings]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((item) =>
        item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      )
    }

    if (typeFilter !== 'All') {
      list = list.filter((item) => item.type === typeFilter)
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'amount-desc':
          return (b.amount || 0) - (a.amount || 0)
        case 'amount-asc':
          return (a.amount || 0) - (b.amount || 0)
        case 'interest-desc':
          return (b.interest || 0) - (a.interest || 0)
        case 'maturity-asc': {
          const daysA = a.maturity ? getDaysRemaining(a.maturity) ?? 99999 : 99999
          const daysB = b.maturity ? getDaysRemaining(b.maturity) ?? 99999 : 99999
          return daysA - daysB
        }
        case 'name-asc':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return list
  }, [savings, search, typeFilter, sortBy])

  // Metric overview
  const summaryStats = useMemo(() => {
    const total = savings.reduce((acc, s) => acc + (s.amount || 0), 0)
    const fixedDeposits = savings
      .filter((s) => ['Fixed Deposit', 'Recurring Deposit'].includes(s.type))
      .reduce((acc, s) => acc + (s.amount || 0), 0)
    const liquidSavings = savings
      .filter((s) => !['Fixed Deposit', 'Recurring Deposit'].includes(s.type))
      .reduce((acc, s) => acc + (s.amount || 0), 0)

    const upcomingCount = savings.filter((s) => {
      if (!s.maturity) return false
      const days = getDaysRemaining(s.maturity)
      return days !== null && days >= 0 && days <= 60
    }).length

    return { total, fixedDeposits, liquidSavings, upcomingCount }
  }, [savings])

  function handleOpenAdd() {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(item) {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  function handleSaveModal(data) {
    if (editingItem) {
      if (onUpdateSaving) {
        onUpdateSaving(data)
      } else {
        onDelete(editingItem.id)
        onAdd(data)
      }
    } else {
      onAdd(data)
    }
  }

  function handleDeleteWithConfirm(item) {
    if (window.confirm(`Are you sure you want to remove "${item.name}"?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Savings & Fixed Deposits
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {savings.length} {savings.length === 1 ? 'account / deposit' : 'accounts and deposits'} registered
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary self-start sm:self-auto">
          <Plus size={16} />
          <span>Add Savings / FD</span>
        </button>
      </div>

      {/* Metric Mini-Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Savings</span>
          <p className="font-heading font-extrabold text-lg text-gray-900 dark:text-white mt-1">
            {fmtINR(summaryStats.total)}
          </p>
        </div>
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Fixed Deposits</span>
          <p className="font-heading font-extrabold text-lg text-gray-900 dark:text-white mt-1">
            {fmtINR(summaryStats.fixedDeposits)}
          </p>
        </div>
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Liquid / Bank Cash</span>
          <p className="font-heading font-extrabold text-lg text-gray-900 dark:text-white mt-1">
            {fmtINR(summaryStats.liquidSavings)}
          </p>
        </div>
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Maturities &lt;60d</span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={summaryStats.upcomingCount > 0 ? 'badge-orange' : 'badge-neutral'}>
              <Clock size={12} /> {summaryStats.upcomingCount} Upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="crm-card p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts, banks, or deposit types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="crm-input pl-10 text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setTypeFilter('All')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'All'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            All
          </button>
          {savingTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <ArrowUpDown size={14} className="text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="crm-input text-xs py-1.5 pr-8 font-medium w-auto"
          >
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="maturity-asc">Closest Maturity</option>
            <option value="interest-desc">Highest Interest %</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block crm-card overflow-hidden">
        <div className="crm-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Account / FD Name</th>
                <th>Type</th>
                <th>Principal Amount</th>
                <th>Interest Rate</th>
                <th>Maturity Date</th>
                <th>Status / Days Left</th>
                <th>Est. Maturity Value</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSavings.map((item) => {
                const daysRemaining = item.maturity ? getDaysRemaining(item.maturity) : null
                const estMaturity = item.interest && item.maturity
                  ? calculateMaturity(item.amount, item.interest, item.startDate || new Date(), item.maturity)
                  : null

                let maturityBadge = null
                if (daysRemaining !== null) {
                  if (daysRemaining < 0) {
                    maturityBadge = <span className="badge-red">Matured</span>
                  } else if (daysRemaining <= 30) {
                    maturityBadge = <span className="badge-orange">{daysRemaining} days left</span>
                  } else {
                    maturityBadge = <span className="badge-neutral">{daysRemaining} days left</span>
                  }
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <strong className="font-heading font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </strong>
                        {item.startDate && (
                          <span className="block text-[11px] text-gray-400">
                            Started {new Date(item.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge-neutral text-[11px]">
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <strong className="font-heading font-bold text-gray-900 dark:text-white">
                        {fmtINR(item.amount)}
                      </strong>
                    </td>
                    <td className="font-semibold text-gray-700 dark:text-gray-300">
                      {item.interest ? `${item.interest}% p.a.` : '—'}
                    </td>
                    <td className="text-gray-600 dark:text-gray-400">
                      {item.maturity ? new Date(item.maturity).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Liquid / Ongoing'}
                    </td>
                    <td>
                      {maturityBadge || <span className="text-xs text-gray-400">Active</span>}
                    </td>
                    <td className="font-heading font-bold text-emerald-600 dark:text-emerald-400">
                      {estMaturity ? fmtINR(estMaturity) : '—'}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWithConfirm(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          title="Delete"
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
          {filteredSavings.length === 0 && (
            <div className="py-16 text-center">
              <Landmark size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="font-heading font-bold text-base text-gray-700 dark:text-gray-300">
                No savings or fixed deposits found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || typeFilter !== 'All' ? 'Try adjusting your search or filters' : 'Add your emergency fund or bank FD above'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {filteredSavings.map((item) => {
          const daysRemaining = item.maturity ? getDaysRemaining(item.maturity) : null
          const estMaturity = item.interest && item.maturity
            ? calculateMaturity(item.amount, item.interest, item.startDate || new Date(), item.maturity)
            : null

          return (
            <div key={item.id} className="crm-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge-neutral text-[10px]">{item.type}</span>
                    {item.interest && (
                      <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                        {item.interest}% p.a.
                      </span>
                    )}
                  </div>
                </div>
                {daysRemaining !== null && (
                  <span className={daysRemaining <= 30 ? (daysRemaining < 0 ? 'badge-red' : 'badge-orange') : 'badge-neutral'}>
                    {daysRemaining < 0 ? 'Matured' : `${daysRemaining}d left`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Principal</span>
                  <p className="font-heading font-extrabold text-sm text-gray-900 dark:text-white mt-0.5">
                    {fmtINR(item.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Maturity Value</span>
                  <p className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {estMaturity ? fmtINR(estMaturity) : 'Liquid'}
                  </p>
                </div>
                {item.maturity && (
                  <div className="col-span-2 text-[11px] text-gray-500">
                    Matures: {new Date(item.maturity).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteWithConfirm(item)}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}

        {filteredSavings.length === 0 && (
          <div className="crm-card py-12 text-center p-4">
            <p className="text-sm font-semibold text-gray-500">No matching savings or deposits found.</p>
          </div>
        )}
      </div>

      {/* Savings Modal */}
      <SavingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
      />
    </div>
  )
}