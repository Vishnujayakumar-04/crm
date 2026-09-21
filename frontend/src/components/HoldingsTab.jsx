import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Check,
  X,
  WalletCards,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { fmtINR, holdingTypes } from '../utils/storage'
import HoldingModal from './HoldingModal'

export default function HoldingsTab({ holdings = [], onAdd, onUpdatePrice, onUpdateHolding, onDelete }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('value-desc')
  const [editingPriceId, setEditingPriceId] = useState(null)
  const [tempPrice, setTempPrice] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // Filtering and sorting
  const filteredHoldings = useMemo(() => {
    let list = [...holdings]

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
      const valA = (a.qty || 0) * (a.current || 0)
      const valB = (b.qty || 0) * (b.current || 0)
      const invA = (a.qty || 0) * (a.buy || 0)
      const invB = (b.qty || 0) * (b.buy || 0)
      const pnlA = valA - invA
      const pnlB = valB - invB
      const retA = invA > 0 ? pnlA / invA : 0
      const retB = invB > 0 ? pnlB / invB : 0

      switch (sortBy) {
        case 'value-desc':
          return valB - valA
        case 'value-asc':
          return valA - valB
        case 'pnl-desc':
          return pnlB - pnlA
        case 'return-desc':
          return retB - retA
        case 'name-asc':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return list
  }, [holdings, search, typeFilter, sortBy])

  // Summary of displayed holdings
  const stats = useMemo(() => {
    let invested = 0
    let current = 0
    filteredHoldings.forEach((item) => {
      invested += (item.qty || 0) * (item.buy || 0)
      current += (item.qty || 0) * (item.current || 0)
    })
    const pnl = current - invested
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0
    return { invested, current, pnl, pnlPercent }
  }, [filteredHoldings])

  function handleQuickEditStart(item) {
    setEditingPriceId(item.id)
    setTempPrice(String(item.current))
  }

  function handleQuickEditSave(item) {
    const p = parseFloat(tempPrice)
    if (!isNaN(p) && p >= 0) {
      onUpdatePrice(item.id, p)
    }
    setEditingPriceId(null)
  }

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
      if (onUpdateHolding) {
        onUpdateHolding(data)
      } else {
        onUpdatePrice(data.id, data.current)
      }
    } else {
      onAdd(data)
    }
  }

  function handleDeleteWithConfirm(item) {
    if (window.confirm(`Are you sure you want to delete ${item.name} from your portfolio?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Shares & Mutual Funds
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {holdings.length} {holdings.length === 1 ? 'total asset' : 'total assets'} tracked in your portfolio
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary self-start sm:self-auto">
          <Plus size={16} />
          <span>Add Position</span>
        </button>
      </div>

      {/* Metric Mini-Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Filtered Value</span>
          <p className="font-heading font-extrabold text-lg text-gray-900 dark:text-white mt-1">
            {fmtINR(stats.current)}
          </p>
        </div>
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Invested Cost</span>
          <p className="font-heading font-extrabold text-lg text-gray-900 dark:text-white mt-1">
            {fmtINR(stats.invested)}
          </p>
        </div>
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Profit / Loss</span>
          <p className={`font-heading font-extrabold text-lg mt-1 ${stats.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {stats.pnl >= 0 ? '+' : ''}{fmtINR(stats.pnl)}
          </p>
        </div>
        <div className="crm-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Overall Return</span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={stats.pnlPercent >= 0 ? 'badge-green' : 'badge-red'}>
              {stats.pnlPercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {stats.pnlPercent >= 0 ? '+' : ''}{stats.pnlPercent.toFixed(2)}%
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
            placeholder="Search by name, symbol, or type..."
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
          {holdingTypes.map((t) => (
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
            <option value="value-desc">Highest Value</option>
            <option value="value-asc">Lowest Value</option>
            <option value="pnl-desc">Highest Profit</option>
            <option value="return-desc">Highest Return %</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block crm-card overflow-hidden">
        <div className="crm-table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Units</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Invested</th>
                <th>Current Value</th>
                <th>P&L / Return</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.map((item) => {
                const invested = item.qty * item.buy
                const value = item.qty * item.current
                const pnl = value - invested
                const returnPct = invested > 0 ? (pnl / invested) * 100 : 0
                const isPositive = pnl >= 0

                return (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <strong className="font-heading font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </strong>
                        {item.buyDate && (
                          <span className="block text-[11px] text-gray-400">
                            Bought {new Date(item.buyDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge-neutral text-[11px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="font-medium text-gray-700 dark:text-gray-300">
                      {item.qty}
                    </td>
                    <td className="text-gray-600 dark:text-gray-400">
                      {fmtINR(item.buy)}
                    </td>
                    <td>
                      {editingPriceId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            autoFocus
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickEditSave(item)}
                            className="w-24 rounded-lg border border-orange-500 bg-white px-2 py-1 text-xs outline-none dark:bg-gray-800"
                          />
                          <button
                            onClick={() => handleQuickEditSave(item)}
                            className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickEditStart(item)}
                          className="group inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                          title="Click to edit current price"
                        >
                          <span>{fmtINR(item.current)}</span>
                          <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-orange-500 transition-opacity" />
                        </button>
                      )}
                    </td>
                    <td className="text-gray-600 dark:text-gray-400 font-medium">
                      {fmtINR(invested)}
                    </td>
                    <td>
                      <strong className="font-heading font-bold text-gray-900 dark:text-white">
                        {fmtINR(value)}
                      </strong>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className={`font-heading font-bold text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isPositive ? '+' : ''}{fmtINR(pnl)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                          title="Full edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWithConfirm(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          title="Delete position"
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
          {filteredHoldings.length === 0 && (
            <div className="py-16 text-center">
              <WalletCards size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="font-heading font-bold text-base text-gray-700 dark:text-gray-300">
                No investment positions found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || typeFilter !== 'All' ? 'Try adjusting your search query or filters' : 'Add your first stock, mutual fund, or ETF position above'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards View (Hidden on desktop) */}
      <div className="md:hidden space-y-3">
        {filteredHoldings.map((item) => {
          const invested = item.qty * item.buy
          const value = item.qty * item.current
          const pnl = value - invested
          const returnPct = invested > 0 ? (pnl / invested) * 100 : 0
          const isPositive = pnl >= 0

          return (
            <div key={item.id} className="crm-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge-neutral text-[10px]">{item.type}</span>
                    <span className="text-[11px] text-gray-400">{item.qty} units</span>
                  </div>
                </div>
                <span className={isPositive ? 'badge-green' : 'badge-red'}>
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {isPositive ? '+' : ''}{returnPct.toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Current Value</span>
                  <p className="font-heading font-extrabold text-sm text-gray-900 dark:text-white mt-0.5">
                    {fmtINR(value)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Invested</span>
                  <p className="font-heading font-bold text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    {fmtINR(invested)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Current Price</span>
                  <div className="mt-0.5">
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="any"
                          autoFocus
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-20 rounded border border-orange-500 px-1 py-0.5 text-xs bg-white dark:bg-gray-800"
                        />
                        <button
                          onClick={() => handleQuickEditSave(item)}
                          className="p-1 rounded bg-emerald-500 text-white"
                        >
                          <Check size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleQuickEditStart(item)}
                        className="font-semibold text-orange-600 dark:text-orange-400 underline decoration-dotted"
                      >
                        {fmtINR(item.current)}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">P&L Amount</span>
                  <p className={`font-heading font-bold text-sm mt-0.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{fmtINR(pnl)}
                  </p>
                </div>
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

        {filteredHoldings.length === 0 && (
          <div className="crm-card py-12 text-center p-4">
            <p className="text-sm font-semibold text-gray-500">No matching holdings found.</p>
          </div>
        )}
      </div>

      {/* Holding Modal for Add / Edit */}
      <HoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
      />
    </div>
  )
}