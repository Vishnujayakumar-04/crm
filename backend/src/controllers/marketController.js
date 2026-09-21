/**
 * Mock / Proxy market quotes service for Portfolio CRM
 */

const SAMPLE_MARKET_DATA = {
  RELIANCE: { cmp: 2980.50, dayChange: 1.25, currency: 'INR' },
  TCS: { cmp: 4210.00, dayChange: -0.45, currency: 'INR' },
  INFY: { cmp: 1890.20, dayChange: 0.85, currency: 'INR' },
  HDFCBANK: { cmp: 1650.00, dayChange: -0.15, currency: 'INR' },
  ICICIBANK: { cmp: 1240.75, dayChange: 1.10, currency: 'INR' },
  NIFTYBEES: { cmp: 275.40, dayChange: 0.65, currency: 'INR' },
  GOLDBEES: { cmp: 68.20, dayChange: 0.30, currency: 'INR' }
}

export function getQuote(req, res, next) {
  try {
    const symbol = (req.params.symbol || '').toUpperCase()
    const quote = SAMPLE_MARKET_DATA[symbol] || {
      cmp: null,
      dayChange: 0,
      currency: 'INR',
      note: 'Symbol quote simulated or unavailable'
    }
    return res.json({ success: true, symbol, data: quote })
  } catch (err) {
    next(err)
  }
}
