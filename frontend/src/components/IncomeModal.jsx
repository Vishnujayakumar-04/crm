import { useState, useEffect } from 'react'
import {
  X,
  TrendingUp,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  IndianRupee,
  Plus
} from 'lucide-react'
import { defaultIncomeCategories, newId } from '../utils/storage'

export default function IncomeModal({ isOpen, onClose, onSave, initialData }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(defaultIncomeCategories[0])
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(String(initialData.amount || ''))
        const isStandard = defaultIncomeCategories.includes(initialData.category)
        if (isStandard) {
          setCategory(initialData.category)
          setIsCustomCategory(false)
          setCustomCategory('')
        } else {
          setCategory('Custom')
          setIsCustomCategory(true)
          setCustomCategory(initialData.category || '')
        }
        setDate(initialData.date || new Date().toISOString().split('T')[0])
        setDescription(initialData.description || '')
        setNotes(initialData.notes || '')
      } else {
        setAmount('')
        setCategory(defaultIncomeCategories[0])
        setIsCustomCategory(false)
        setCustomCategory('')
        setDate(new Date().toISOString().split('T')[0])
        setDescription('')
        setNotes('')
      }
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than zero (₹0).')
      return
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category
    if (!finalCategory) {
      setError('Please select or specify an income category.')
      return
    }

    if (!date) {
      setError('Please select a valid transaction date.')
      return
    }

    const incomePayload = {
      id: initialData?.id || newId(),
      amount: numAmount,
      category: finalCategory,
      date,
      description: description.trim(),
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    }

    onSave(incomePayload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#181b22] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                {initialData ? 'Edit Income' : 'Record New Income'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Log salary, dividends, freelance, and other cash inflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-red-50 p-3.5 text-xs text-red-700 dark:bg-red-950/40 dark:border dark:border-red-900/50 dark:text-red-300">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Income Amount (₹) *
            </label>
            <div className="relative">
              <IndianRupee size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="crm-input pl-11 text-base font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Income Source *
              </label>
              <div className="relative">
                <Tag size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={isCustomCategory ? 'Custom' : category}
                  onChange={(e) => {
                    if (e.target.value === 'Custom') {
                      setIsCustomCategory(true)
                    } else {
                      setIsCustomCategory(false)
                      setCategory(e.target.value)
                    }
                  }}
                  className="crm-input pl-11 text-xs font-semibold"
                >
                  {defaultIncomeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Custom">+ Custom Source...</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Receipt Date *
              </label>
              <div className="relative">
                <Calendar size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="crm-input pl-11 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Custom Category Input if selected */}
          {isCustomCategory && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Custom Source Name *
              </label>
              <div className="relative">
                <Plus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Consulting, Rental Property"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="crm-input pl-11 text-xs font-medium"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <div className="relative">
              <FileText size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Monthly Salary Credit, Dividend from TCS"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="crm-input pl-11 text-xs font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add optional notes, invoice numbers, or transaction IDs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="crm-input text-xs font-medium resize-none py-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary py-2.5 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {initialData ? 'Update Income' : 'Save Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
