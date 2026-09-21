import { useState, useEffect } from 'react'
import { X, TrendingUp, AlertCircle, Calendar, Hash, Tag, DollarSign } from 'lucide-react'
import { holdingTypes, fmtINR, newId } from '../utils/storage'

export default function HoldingModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Stock')
  const [qty, setQty] = useState('')
  const [buy, setBuy] = useState('')
  const [current, setCurrent] = useState('')
  const [buyDate, setBuyDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setType(initialData.type || 'Stock')
      setQty(initialData.qty !== undefined ? String(initialData.qty) : '')
      setBuy(initialData.buy !== undefined ? String(initialData.buy) : '')
      setCurrent(initialData.current !== undefined ? String(initialData.current) : '')
      setBuyDate(initialData.buyDate || '')
    } else {
      setName('')
      setType('Stock')
      setQty('')
      setBuy('')
      setCurrent('')
      setBuyDate('')
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const numQty = parseFloat(qty) || 0
  const numBuy = parseFloat(buy) || 0
  const numCurrent = parseFloat(current) || 0
  const totalInvested = numQty * numBuy
  const totalCurrent = numQty * numCurrent
  const pnl = totalCurrent - totalInvested
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0
  const isPositive = pnl >= 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter asset name or symbol')
      return
    }
    if (isNaN(numQty) || numQty <= 0) {
      setError('Please enter a valid quantity greater than 0')
      return
    }
    if (isNaN(numBuy) || numBuy < 0) {
      setError('Please enter a valid purchase price')
      return
    }
    if (isNaN(numCurrent) || numCurrent < 0) {
      setError('Please enter a valid current price')
      return
    }

    onSave({
      id: initialData ? initialData.id : newId(),
      name: name.trim().toUpperCase(),
      type,
      qty: numQty,
      buy: numBuy,
      current: numCurrent,
      buyDate: buyDate || new Date().toISOString().split('T')[0]
    })
    onClose()
  }

  return (
    <div className="crm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="crm-modal-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
              {initialData ? 'Edit Investment Position' : 'Add Investment Position'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track shares, mutual funds, ETFs, and alternate assets
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
              Asset Name / Symbol
            </label>
            <input
              type="text"
              required
              className="crm-input font-medium"
              placeholder="e.g. RELIANCE, HDFCBANK, NIFTYBEES"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Asset Type
              </label>
              <select
                className="crm-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {holdingTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Purchase Date (Optional)
              </label>
              <input
                type="date"
                className="crm-input"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Quantity / Units
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                className="crm-input"
                placeholder="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Buy Price (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                className="crm-input"
                placeholder="0.00"
                value={buy}
                onChange={(e) => setBuy(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Current Price (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                className="crm-input"
                placeholder="0.00"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Calculation Preview Card */}
          {numQty > 0 && numBuy > 0 && (
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-950/50 dark:bg-orange-950/20">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Real-Time Position Preview</span>
                <span className={`font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Invested</p>
                  <p className="font-heading font-bold text-sm text-gray-900 dark:text-white">{fmtINR(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Current Value</p>
                  <p className="font-heading font-bold text-sm text-gray-900 dark:text-white">{fmtINR(totalCurrent)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">P&L</p>
                  <p className={`font-heading font-bold text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{fmtINR(pnl)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {initialData ? 'Update Position' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
