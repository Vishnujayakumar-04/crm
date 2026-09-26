import fs from 'fs'
import path from 'path'
import { config } from '../config/env.js'

const usersDir = path.join(config.dataDir, 'users')

function ensureDir() {
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir, { recursive: true })
  }
}

function getUserFilePath(uid) {
  ensureDir()
  // Sanitize uid to prevent path traversal
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(usersDir, `${safeUid}.json`)
}

export function getUserData(uid) {
  const file = getUserFilePath(uid)
  if (!fs.existsSync(file)) {
    return {
      profile: { name: 'Vishnu J', phone: '', gender: 'Male', dob: '', avatar: '' },
      holdings: [],
      savings: [],
      expenses: [],
      income: [],
      activities: [],
      history: []
    }
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[StorageService] Error reading data for ${uid}:`, err)
    return null
  }
}

export function saveUserData(uid, data) {
  const file = getUserFilePath(uid)
  try {
    const current = getUserData(uid) || {}
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    }
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf-8')
    return updated
  } catch (err) {
    console.error(`[StorageService] Error saving data for ${uid}:`, err)
    throw err
  }
}

export function updateUserProfile(uid, profileData) {
  const current = getUserData(uid)
  const updatedProfile = {
    ...(current.profile || {}),
    ...profileData
  }
  return saveUserData(uid, { ...current, profile: updatedProfile })
}
