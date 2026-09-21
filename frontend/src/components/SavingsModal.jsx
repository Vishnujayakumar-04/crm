import { useState, useEffect } from 'react'
import { X, Landmark, AlertCircle, Calendar, Percent } from 'lucide-react'
import { savingTypes, fmtINR, newId, calculateMaturity, getDaysRemaining } from '../utils/storage'

export default function SavingsModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Fixed Deposit')
  const [amount, setAmount] = useState('')
  const [interest, setInterest] = useState('')
  const [startDate, setStartDate] = useState('')
  const [maturity, setMaturity] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setType(initialData.type || 'Fixed Deposit')
      setAmount(initialData.amount !== undefined ? String(initialData.amount) : '')
      setInterest(initialData.interest !== null && initialData.interest !== undefined ? String(initialData.interest) : '')
      setStartDate(initialData.startDate || '')
      setMaturity(initialData.maturity || '')
    } else {
      setName('')
      setType('Fixed Deposit')
      setAmount('')
      setInterest('')
      setStartDate(new Date().toISOString().split('T')[0])
      setMaturity('')
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const numAmount = parseFloat(amount) || 0
  const numInterest = parseFloat(interest) || 0
  const isDeposit = ['Fixed Deposit', 'Recurring Deposit', 'PPF'].includes(type)
  const estMaturityVal = isDeposit && numAmount > 0 && numInterest > 0 && maturity
    ? calculateMaturity(numAmount, numInterest, startDate || new Date(), maturity)
    : null
  const daysLeft = maturity ? getDaysRemaining(maturity) : null

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter account or deposit name')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    onSave({
      id: initialData ? initialData.id : newId(),
      name: name.trim(),
      type,
      amount: numAmount,
      interest: interest !== '' ? numInterest : null,
      startDate: startDate || new Date().toISOString().split('T')[0],
      maturity: maturity || null
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
              {initialData ? 'Edit Savings / Deposit' : 'Add Savings or Deposit'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track emergency funds, fixed deposits, and recurring savings
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
              Account / Deposit Name
            </label>
            <input
              type="text"
              required
              className="crm-input font-medium"
              placeholder="e.g. HDFC 1-Year FD, Emergency Reserve, SBI PPF"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Account Type
              </label>
              <select
                className="crm-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {savingTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Principal Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                className="crm-input"
                placeholder="₹ 0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="crm-input"
                placeholder="e.g. 7.25"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                className="crm-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Maturity Date
              </label>
              <input
                type="date"
                className="crm-input"
                value={maturity}
                onChange={(e) => setMaturity(e.target.value)}
              />
            </div>
          </div>

          {/* Deposit Preview if Applicable */}
          {estMaturityVal && estMaturityVal > numAmount && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-950/50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 mb-2">
                <span className="font-semibold">Maturity Estimate (Quarterly Compounding)</span>
                {daysLeft !== null && (
                  <span className="rounded-md bg-amber-200/70 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Matured'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Principal</p>
                  <p className="font-heading font-bold text-sm text-gray-900 dark:text-white">{fmtINR(numAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Estimated Value at Maturity</p>
                  <p className="font-heading font-bold text-sm text-emerald-600 dark:text-emerald-400">{fmtINR(estMaturityVal)}</p>
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
              {initialData ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
