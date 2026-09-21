/**
 * Portfolio CRM API Client
 * Facilitates REST communication between the Frontend and Backend API (port 5000)
 * Includes automated fallback handling for resilience.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Health check to see if the Backend REST API is accessible
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' })
    if (!res.ok) return { status: 'down', ok: false }
    const data = await res.json()
    return { status: 'ok', ok: true, data }
  } catch (err) {
    return { status: 'unreachable', ok: false, error: err.message }
  }
}

/**
 * Get portfolio holdings, savings, and activities for a user
 */
export async function getPortfolioFromBackend(uid) {
  if (!uid) return null
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/${uid}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.data || null
  } catch (err) {
    console.warn('[API Client] Falling back from backend portfolio load:', err.message)
    return null
  }
}

/**
 * Save / sync portfolio data to backend
 */
export async function savePortfolioToBackend(uid, portfolioData) {
  if (!uid) return false
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/${uid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portfolioData)
    })
    return res.ok
  } catch (err) {
    console.warn('[API Client] Backend portfolio save skipped:', err.message)
    return false
  }
}

/**
 * Fetch extended user profile from backend
 */
export async function getProfileFromBackend(uid) {
  if (!uid) return null
  try {
    const res = await fetch(`${API_BASE_URL}/profile/${uid}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.data || null
  } catch (err) {
    console.warn('[API Client] Backend profile fetch skipped:', err.message)
    return null
  }
}

/**
 * Update extended user profile on backend
 */
export async function updateProfileOnBackend(uid, profileData) {
  if (!uid) return false
  try {
    const res = await fetch(`${API_BASE_URL}/profile/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    })
    return res.ok
  } catch (err) {
    console.warn('[API Client] Backend profile update skipped:', err.message)
    return false
  }
}

/**
 * Request real-time valuation summary calculations from backend
 */
export async function getPortfolioSummaryFromBackend(uid) {
  if (!uid) return null
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/${uid}/summary`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.data || null
  } catch (err) {
    return null
  }
}
