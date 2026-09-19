import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCklW75pWdpTOaxiVIz8OFRNR7EaaUuD14",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vishnucrm-90dcc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vishnucrm-90dcc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vishnucrm-90dcc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "231097803577",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:231097803577:web:3915b51f22046dc1aabee8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3ZXEX83M0X"
}

/**
 * Checks whether valid Firebase configuration keys have been provided
 */
export function isFirebaseConfigured() {
  const key = firebaseConfig.apiKey
  return Boolean(
    key &&
    typeof key === 'string' &&
    key.length > 10 &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  )
}

// Initialize Firebase App safely
let app = null
let auth = null
let db = null
let analytics = null

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app)
      }
    }).catch(() => {})
  }
} catch (err) {
  console.warn('Firebase initialization warning:', err)
}

export { app, auth, db, analytics }

/**
 * Translate Firebase error codes to user-friendly messages
 */
export function formatAuthError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.'
  const code = error.code || ''
  const message = error.message || ''

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email. Please check or sign up.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.'
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Access temporarily locked for security. Please try again in a few minutes.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.'
    case 'auth/expired-action-code':
      return 'This password reset link has expired. Please request a new one.'
    case 'auth/configuration-not-found':
      return "Email/Password provider is not enabled in your Firebase project. Please go to Firebase Console -> Authentication -> Sign-in method, click 'Email/Password', enable it, and click Save."
    case 'auth/operation-not-allowed':
      return "Email/Password sign-in is disabled in your Firebase project. Please enable it in Firebase Console under Authentication -> Sign-in method."
    default:
      if (message.includes('API key not valid')) {
        return 'Invalid Firebase API Key. Please verify your configuration.'
      }
      return message.replace('Firebase: ', '') || 'Authentication failed.'
  }
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.')
  }
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
  return userCredential.user
}

/**
 * Register a new user with email, password, and display name
 */
export async function registerWithEmail(email, password, fullName) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.')
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const user = userCredential.user

  if (fullName && fullName.trim()) {
    try {
      await updateProfile(user, { displayName: fullName.trim() })
    } catch (err) {
      console.warn('Could not update user display name:', err)
    }
  }

  // Optionally send verification email
  try {
    await sendEmailVerification(user)
  } catch (err) {
    console.warn('Could not send verification email:', err)
  }

  return user
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.')
  }
  await sendPasswordResetEmail(auth, email.trim())
}

/**
 * Verify password reset code from email link
 */
export async function verifyResetCode(oobCode) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.')
  }
  return await verifyPasswordResetCode(auth, oobCode)
}

/**
 * Confirm password reset with new password
 */
export async function confirmNewPassword(oobCode, newPassword) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized.')
  }
  await confirmPasswordReset(auth, oobCode, newPassword)
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  if (!auth) return
  await signOut(auth)
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

/**
 * Save user portfolio data to Firestore for cloud sync
 */
export async function savePortfolioToFirestore(userId, portfolioData) {
  if (!db || !userId || !portfolioData) return
  try {
    const userDocRef = doc(db, 'users', userId)
    await setDoc(userDocRef, {
      portfolio: portfolioData,
      updatedAt: Date.now()
    }, { merge: true })
  } catch (err) {
    console.warn('Firestore cloud sync notice:', err.message)
  }
}

/**
 * Load user portfolio data from Firestore
 */
export async function loadPortfolioFromFirestore(userId) {
  if (!db || !userId) return null
  try {
    const userDocRef = doc(db, 'users', userId)
    const snapshot = await getDoc(userDocRef)
    if (snapshot.exists()) {
      const data = snapshot.data()
      return data?.portfolio || null
    }
    return null
  } catch (err) {
    console.warn('Firestore cloud fetch notice:', err.message)
    return null
  }
}
