import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { fmtINR } from '../utils/storage'
import { TrendingUp, PieChart as PieIcon, Layers, Shield } from 'lucide-react'

const ALLOCATION_COLORS = [
  '#f97316', // Orange
  '#fb923c', // Light Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b'  // Slate
]

export default function AllocationTab({ holdings = [], savings = [] }) {
  const { categories, totalValue, totalInvested } = useMemo(() => {
    const map = {}
    let holdingsTotal = 0
    let holdingsInvested = 0

    holdings.forEach((h) => {
      const cur = (h.qty || 0) * (h.current || 0)
      const inv = (h.qty || 0) * (h.buy || 0)
      holdingsTotal += cur
      holdingsInvested += inv

      if (!map[h.type]) {
        map[h.type] = { name: h.type, current: 0, invested: 0, count: 0, isHolding: true }
      }
      map[h.type].current += cur
      map[h.type].invested += inv
      map[h.type].count += 1
    })

    let savingsTotal = 0
    savings.forEach((s) => {
      const amt = Number(s.amount || 0)
      savingsTotal += amt

      if (!map[s.type]) {
        map[s.type] = { name: s.type, current: 0, invested: 0, count: 0, isHolding: false }
      }
      map[s.type].current += amt
      map[s.type].invested += amt
      map[s.type].count += 1
    })

    const grandTotal = holdingsTotal + savingsTotal
    const grandInvested = holdingsInvested + savingsTotal

    const categoryList = Object.values(map)
      .map((cat, idx) => ({
        ...cat,
        color: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length],
        percentage: grandTotal > 0 ? (cat.current / grandTotal) * 100 : 0
      }))
      .sort((a, b) => b.current - a.current)

    return {
      categories: categoryList,
      totalValue: grandTotal,
      totalInvested: grandInvested
    }
  }, [holdings, savings])

  const chartData = categories.map((c) => ({
    name: c.name,
    value: c.current,
    color: c.color
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Asset Allocation
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Distribution of your total net worth across asset classes and risk buckets
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Donut Chart Card */}
          <section className="crm-card p-6 lg:col-span-5 flex flex-col items-center justify-center">
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-2 self-start">
              Portfolio Weight
            </h3>
            <p className="text-xs text-gray-400 mb-6 self-start">
              Hover slices to inspect class value
            </p>

            <div className="relative h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => [fmtINR(value), 'Value']}
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Total Worth
                </span>
                <span className="font-heading font-extrabold text-xl text-gray-900 dark:text-white">
                  {fmtINR(totalValue, { compact: true })}
                </span>
                <span className="text-[11px] text-gray-500">
                  {categories.length} classes
                </span>
              </div>
            </div>

            {/* Quick Legend Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{cat.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Allocation Breakdown Progress List */}
          <section className="crm-card p-6 lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                  Class-by-Class Breakdown
                </h3>
                <p className="text-xs text-gray-400">
                  Detailed capital allocation and position count
                </p>
              </div>
              <span className="badge-neutral text-xs font-bold">
                {categories.length} Distinct Buckets
              </span>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.name} className="rounded-2xl border border-gray-100 p-4 transition-all hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-heading font-bold text-sm text-gray-900 dark:text-white">
                        {cat.name}
                      </span>
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800">
                        {cat.count} {cat.count === 1 ? 'position' : 'positions'}
                      </span>
                    </div>
                    <div className="text-right">
                      <strong className="font-heading font-extrabold text-sm text-gray-900 dark:text-white">
                        {fmtINR(cat.current)}
                      </strong>
                      <span className="ml-2 font-bold text-xs text-orange-600 dark:text-orange-400">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(cat.percentage, 1)}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>

                  {/* Subtitle with Invested comparison if market holding */}
                  {cat.isHolding && cat.invested > 0 && (
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Invested: {fmtINR(cat.invested)}</span>
                      <span className={cat.current >= cat.invested ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                        {cat.current >= cat.invested ? '+' : ''}{fmtINR(cat.current - cat.invested)} (
                        {(((cat.current - cat.invested) / cat.invested) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="crm-card py-20 text-center p-6">
          <PieIcon size={44} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-gray-200">
            No Portfolio Data to Allocate
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Add shares, mutual funds, emergency funds, or fixed deposits to visualize your asset distribution.
          </p>
        </div>
      )}
    </div>
  )
}