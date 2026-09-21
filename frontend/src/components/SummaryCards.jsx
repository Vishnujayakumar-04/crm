import { fmtINR } from '../utils/storage'
import { WalletCards, Landmark, TrendingUp, DollarSign } from 'lucide-react'

const cards = [
  { key: 'netWorth', label: 'Net Worth', icon: DollarSign, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  { key: 'invested', label: 'Total Invested', icon: WalletCards, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
  { key: 'current', label: 'Current Value', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  { key: 'savings', label: 'Savings & FDs', icon: Landmark, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
]

export default function SummaryCards({ summary }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article className="crm-card p-4 flex flex-col justify-between" key={card.key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {card.label}
              </span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.color}`}>
                <Icon size={15} />
              </div>
            </div>
            <div>
              <p className="font-heading font-extrabold text-xl tracking-tight text-gray-950 dark:text-white">
                {fmtINR(summary[card.key])}
              </p>
              {card.key === 'current' && (
                <p className={`mt-1 text-xs font-semibold ${summary.gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summary.gain >= 0 ? '+' : ''}{fmtINR(summary.gain)} · {summary.gainPercent.toFixed(1)}%
                </p>
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}