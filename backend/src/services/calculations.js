/**
 * Portfolio CRM Financial Analytics & Valuation Engine
 */

export function calculatePortfolioSummary(holdings = [], savings = []) {
  let totalInvested = 0
  let currentHoldingsValue = 0
  let totalDayChange = 0

  holdings.forEach((h) => {
    const qty = Number(h.qty) || 0
    const buy = Number(h.buy) || 0
    const cmp = Number(h.cmp) || buy
    const dayChangePct = Number(h.dayChange) || 0

    const invested = qty * buy
    const current = qty * cmp
    const dayChangeAmount = current * (dayChangePct / 100)

    totalInvested += invested
    currentHoldingsValue += current
    totalDayChange += dayChangeAmount
  })

  let totalSavingsValue = 0
  savings.forEach((s) => {
    totalSavingsValue += Number(s.amount) || 0
  })

  const totalPortfolioValue = currentHoldingsValue + totalSavingsValue
  const totalGainLoss = currentHoldingsValue - totalInvested
  const totalGainLossPct = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
  const dayChangePct = totalPortfolioValue > 0 ? (totalDayChange / totalPortfolioValue) * 100 : 0

  // Asset allocation percentages
  const allocation = {
    equity: totalPortfolioValue > 0 ? (currentHoldingsValue / totalPortfolioValue) * 100 : 0,
    cashAndFixed: totalPortfolioValue > 0 ? (totalSavingsValue / totalPortfolioValue) * 100 : 0
  }

  return {
    totalPortfolioValue,
    currentHoldingsValue,
    totalSavingsValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPct,
    totalDayChange,
    dayChangePct,
    allocation,
    holdingsCount: holdings.length,
    savingsCount: savings.length
  }
}
