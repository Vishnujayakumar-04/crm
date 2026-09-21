import { getUserData, saveUserData } from '../services/storageService.js'

export function exportBackup(req, res, next) {
  try {
    const { uid } = req.params
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    const data = getUserData(uid)
    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'Portfolio CRM',
      ...data
    }
    return res.json({ success: true, data: backupPayload })
  } catch (err) {
    next(err)
  }
}

export function importBackup(req, res, next) {
  try {
    const { uid } = req.params
    const backup = req.body
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    if (!backup || typeof backup !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid JSON backup payload' })
    }
    const sanitized = {
      profile: backup.profile || { name: 'Vishnu J' },
      holdings: Array.isArray(backup.holdings) ? backup.holdings : [],
      savings: Array.isArray(backup.savings) ? backup.savings : [],
      activities: Array.isArray(backup.activities) ? backup.activities : [],
      history: Array.isArray(backup.history) ? backup.history : []
    }
    const saved = saveUserData(uid, sanitized)
    return res.json({
      success: true,
      message: `Imported ${sanitized.holdings.length} holdings and ${sanitized.savings.length} savings records`,
      data: saved
    })
  } catch (err) {
    next(err)
  }
}
