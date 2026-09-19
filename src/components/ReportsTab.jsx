import { useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  ShieldCheck,
  AlertTriangle,
  Award,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { fmtINR } from '../utils/storage'

export default function ReportsTab({ holdings = [], savings = [] }) {
  // Calculations
  const metrics = useMemo(() => {
    let totalInvested = 0
    let totalCurrent = 0
    let totalGain = 0

    const holdingsWithMetrics = holdings.map((h) => {
      const invested = (h.qty || 0) * (h.buy || 0)
      const current = (h.qty || 0) * (h.current || 0)
      const pnl = current - invested
      const returnPct = invested > 0 ? (pnl / invested) * 100 : 0
      totalInvested += invested
      totalCurrent += current
      totalGain += pnl
      return { ...h, invested, current, pnl, returnPct }
    })

    const totalSavings = savings.reduce((acc, s) => acc + (s.amount || 0), 0)
    const netWorth = totalCurrent + totalSavings

    // Best and Worst Performers
    const sortedByReturn = [...holdingsWithMetrics].sort((a, b) => b.returnPct - a.returnPct)
    const topGainers = sortedByReturn.filter((h) => h.pnl > 0).slice(0, 3)
    const topLosers = [...sortedByReturn].reverse().filter((h) => h.pnl < 0).slice(0, 3)

    // Weighted average interest on deposits
    const depositsWithInterest = savings.filter((s) => s.interest && s.amount)
    const totalDepositPrincipal = depositsWithInterest.reduce((sum, s) => sum + s.amount, 0)
    const weightedAvgInterest = totalDepositPrincipal > 0
      ? depositsWithInterest.reduce((sum, s) => sum + s.amount * s.interest, 0) / totalDepositPrincipal
      : 0

    // Asset distribution by category
    const categoryTotals = {}
    holdingsWithMetrics.forEach((h) => {
      categoryTotals[h.type] = (categoryTotals[h.type] || 0) + h.current
    })
    savings.forEach((s) => {
      categoryTotals[s.type] = (categoryTotals[s.type] || 0) + s.amount
    })

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      share: netWorth > 0 ? (value / netWorth) * 100 : 0
    })).sort((a, b) => b.value - a.value)

    // Diversification score (out of 100)
    // Penalize if one asset holds > 35% of net worth
    const maxAssetConcentration = Math.max(
      ...holdingsWithMetrics.map((h) => (netWorth > 0 ? (h.current / netWorth) * 100 : 0)),
      0
    )
    let diversificationScore = 85
    if (maxAssetConcentration > 50) diversificationScore -= 30
    else if (maxAssetConcentration > 30) diversificationScore -= 15
    if (chartData.length >= 4) diversificationScore += 10
    if (diversificationScore > 98) diversificationScore = 98

    return {
      totalInvested,
      totalCurrent,
      totalGain,
      totalSavings,
      netWorth,
      overallReturn: totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0,
      topGainers,
      topLosers,
      weightedAvgInterest,
      chartData,
      diversificationScore: Math.max(20, Math.min(100, diversificationScore)),
      maxAssetConcentration
    }
  }, [holdings, savings])

  const barColors = ['#f97316', '#fb923c', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Portfolio Analytics & Performance Report
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          In-depth breakdown of your asset yields, diversification health, and performance drivers
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="crm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Portfolio Health Score
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-orange-600 dark:text-orange-400">
              {metrics.diversificationScore}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {metrics.diversificationScore >= 80 ? 'Well-diversified allocation' : 'Moderate concentration risk'}
          </p>
        </div>

        <div className="crm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Overall Investment Return
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-heading text-3xl font-extrabold ${metrics.overallReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {metrics.overallReturn >= 0 ? '+' : ''}{metrics.overallReturn.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Net return: {fmtINR(metrics.totalGain)}
          </p>
        </div>

        <div className="crm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Avg. Fixed Yield (Deposits)
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-gray-900 dark:text-white">
              {metrics.weightedAvgInterest.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">p.a.</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Weighted across {savings.filter((s) => s.interest).length} interest accounts
          </p>
        </div>

        <div className="crm-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Max Single Concentration
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-gray-900 dark:text-white">
              {metrics.maxAssetConcentration.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {metrics.maxAssetConcentration > 35 ? 'Consider rebalancing' : 'Healthy position sizing'}
          </p>
        </div>
      </div>

      {/* Asset Values Breakdown Chart */}
      <section className="crm-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
              Asset Class Allocation (₹)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total capital distributed across categories
            </p>
          </div>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
            Total {fmtINR(metrics.netWorth, { compact: true })}
          </span>
        </div>

        {metrics.chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
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
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {metrics.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            Add holdings or savings to generate allocation analytics.
          </div>
        )}
      </section>

      {/* Performance Drivers: Gainers vs Losers */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Gainers */}
        <section className="crm-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">
                Top Gainers
              </h3>
              <p className="text-[11px] text-gray-500">Highest percentage appreciation</p>
            </div>
          </div>

          {metrics.topGainers.length > 0 ? (
            <div className="space-y-3">
              {metrics.topGainers.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40">
                  <div>
                    <span className="font-heading font-bold text-sm text-gray-900 dark:text-white">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({item.type})</span>
                    <p className="text-xs text-gray-500">Invested: {fmtINR(item.invested)}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge-green">
                      <ArrowUpRight size={12} /> +{item.returnPct.toFixed(1)}%
                    </span>
                    <p className="mt-1 font-heading font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      +{fmtINR(item.pnl)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-gray-500">No profitable positions recorded yet.</p>
          )}
        </section>

        {/* Top Losers */}
        <section className="crm-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <TrendingDown size={18} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-gray-900 dark:text-white">
                Drawdown Positions
              </h3>
              <p className="text-[11px] text-gray-500">Positions currently below cost basis</p>
            </div>
          </div>

          {metrics.topLosers.length > 0 ? (
            <div className="space-y-3">
              {metrics.topLosers.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40">
                  <div>
                    <span className="font-heading font-bold text-sm text-gray-900 dark:text-white">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({item.type})</span>
                    <p className="text-xs text-gray-500">Invested: {fmtINR(item.invested)}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge-red">
                      <ArrowDownRight size={12} /> {item.returnPct.toFixed(1)}%
                    </span>
                    <p className="mt-1 font-heading font-bold text-xs text-red-600 dark:text-red-400">
                      {fmtINR(item.pnl)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-gray-500">No negative positions in portfolio.</p>
          )}
        </section>
      </div>
    </div>
  )
}
