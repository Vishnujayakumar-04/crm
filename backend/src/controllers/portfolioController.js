import { getUserData, saveUserData } from '../services/storageService.js'
import { calculatePortfolioSummary } from '../services/calculations.js'

export function getPortfolio(req, res, next) {
  try {
    const { uid } = req.params
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    const data = getUserData(uid)
    return res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export function savePortfolio(req, res, next) {
  try {
    const { uid } = req.params
    const payload = req.body
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    const saved = saveUserData(uid, payload)
    return res.json({ success: true, message: 'Portfolio saved successfully', data: saved })
  } catch (err) {
    next(err)
  }
}

export function getSummary(req, res, next) {
  try {
    const { uid } = req.params
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    const data = getUserData(uid)
    const summary = calculatePortfolioSummary(data.holdings, data.savings)
    return res.json({ success: true, data: summary })
  } catch (err) {
    next(err)
  }
}
