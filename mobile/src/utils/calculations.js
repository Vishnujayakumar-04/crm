// Financial calculations module for Portfolio CRM Mobile

export function fmtINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0'
  const num = Math.round(val)
  return '₹' + num.toLocaleString('en-IN')
}

export function fmtPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '0.0%'
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(2)}%`
}

/**
 * Standard Indian Banking Quarterly Compounding formula for Fixed Deposits:
 * A = P * (1 + r / 400)^(4 * t)
 * where t = tenure in years (tenureMonths / 12)
 */
export function calcFDMaturity(principal, rate, tenureMonths) {
  const P = parseFloat(principal) || 0
  const r = parseFloat(rate) || 0
  const m = parseFloat(tenureMonths) || 12
  if (P <= 0) return 0
  if (r <= 0) return P
  const t = m / 12
  const maturity = P * Math.pow(1 + r / 400, 4 * t)
  return Math.round(maturity)
}

export function getDaysRemaining(maturityDate) {
  if (!maturityDate) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const mat = new Date(maturityDate)
  mat.setHours(0, 0, 0, 0)
  const diffTime = mat.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function computePortfolioSummary(holdings = [], savings = []) {
  let investedHoldings = 0
  let currentHoldings = 0

  holdings.forEach((h) => {
    const qty = parseFloat(h.qty) || 0
    const buy = parseFloat(h.buy) || 0
    const curr = parseFloat(h.current) || buy
    investedHoldings += qty * buy
    currentHoldings += qty * curr
  })

  let savingsAccountsTotal = 0
  let fdsPrincipalTotal = 0
  let fdsMaturityTotal = 0

  savings.forEach((s) => {
    const amount = parseFloat(s.amount) || 0
    if (s.type === 'FD') {
      fdsPrincipalTotal += amount
      const mat = s.maturityAmount ? parseFloat(s.maturityAmount) : calcFDMaturity(amount, s.interest, s.tenure)
      fdsMaturityTotal += mat
    } else {
      savingsAccountsTotal += amount
    }
  })

  const totalSavings = savingsAccountsTotal + fdsPrincipalTotal
  const totalNetWorth = currentHoldings + totalSavings
  const totalInvested = investedHoldings + totalSavings
  const totalPnl = currentHoldings - investedHoldings
  const pnlPercent = investedHoldings > 0 ? (totalPnl / investedHoldings) * 100 : 0

  return {
    netWorth: totalNetWorth,
    investedHoldings,
    currentHoldings,
    totalPnl,
    pnlPercent,
    savingsAccountsTotal,
    fdsPrincipalTotal,
    fdsMaturityTotal,
    totalSavings,
    totalInvested
  }
}
