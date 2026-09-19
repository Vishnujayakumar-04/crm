import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCklW75pWdpTOaxiVIz8OFRNR7EaaUuD14",
  authDomain: "vishnucrm-90dcc.firebaseapp.com",
  projectId: "vishnucrm-90dcc",
  storageBucket: "vishnucrm-90dcc.firebasestorage.app",
  messagingSenderId: "231097803577",
  appId: "1:231097803577:web:3915b51f22046dc1aabee8",
  measurementId: "G-3ZXEX83M0X"
}

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Initialize Auth with AsyncStorage persistence for React Native
let auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  })
} catch {
  // If already initialized in hot-reload
  const { getAuth } = require('firebase/auth')
  auth = getAuth(app)
}

const db = getFirestore(app)

export { auth, db }

export async function loginMobile(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
  return cred.user
}

export async function signupMobile(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName })
  }
  return cred.user
}

export async function logoutMobile() {
  await signOut(auth)
}

export function onMobileAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function sendMobilePasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim())
}

// Cloud Firestore Sync (users/{uid}/portfolio/data)
export async function saveMobilePortfolio(userId, portfolioData) {
  if (!userId) return false
  try {
    const userDocRef = doc(db, 'users', userId, 'portfolio', 'data')
    await setDoc(userDocRef, {
      ...portfolioData,
      updatedAt: serverTimestamp()
    }, { merge: true })
    return true
  } catch (err) {
    console.warn('Firestore mobile save error:', err)
    return false
  }
}

export async function loadMobilePortfolio(userId) {
  if (!userId) return null
  try {
    const userDocRef = doc(db, 'users', userId, 'portfolio', 'data')
    const snap = await getDoc(userDocRef)
    if (snap.exists()) {
      return snap.data()
    }
    return null
  } catch (err) {
    console.warn('Firestore mobile load error:', err)
    return null
  }
}
