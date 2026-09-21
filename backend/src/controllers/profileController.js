import { getUserData, updateUserProfile } from '../services/storageService.js'

export function getProfile(req, res, next) {
  try {
    const { uid } = req.params
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    const data = getUserData(uid)
    return res.json({
      success: true,
      data: data.profile || { name: 'Vishnu J', phone: '', gender: 'Male', dob: '', avatar: '' }
    })
  } catch (err) {
    next(err)
  }
}

export function updateProfile(req, res, next) {
  try {
    const { uid } = req.params
    const profileUpdates = req.body
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID is required' })
    }
    const updated = updateUserProfile(uid, profileUpdates)
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated.profile
    })
  } catch (err) {
    next(err)
  }
}
