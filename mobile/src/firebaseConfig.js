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

export async function signupMobile(email, password, displayName, profileDetails = {}) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName })
    } catch {}
  }
  if (cred.user) {
    try {
      const userDocRef = doc(db, 'users', cred.user.uid)
      await setDoc(userDocRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || '',
        phone: profileDetails.phone || '',
        gender: profileDetails.gender || '',
        dob: profileDetails.dob || '',
        createdAt: serverTimestamp()
      }, { merge: true })
    } catch (e) {
      console.warn('Could not save mobile user profile:', e)
    }
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

// Cloud Firestore Sync (Unified across Web, Desktop, and Mobile)
export async function saveMobilePortfolio(userId, portfolioData) {
  if (!userId) return false
  try {
    // 1. Primary document: users/{userId}.portfolio
    const userDocRef = doc(db, 'users', userId)
    await setDoc(userDocRef, {
      portfolio: portfolioData,
      updatedAt: serverTimestamp()
    }, { merge: true })

    // 2. Also keep subcollection synchronized for full backward compatibility
    const subDocRef = doc(db, 'users', userId, 'portfolio', 'data')
    await setDoc(subDocRef, {
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
    // 1. Check primary location: users/{userId}.portfolio
    const userDocRef = doc(db, 'users', userId)
    const snap = await getDoc(userDocRef)
    if (snap.exists() && snap.data()?.portfolio) {
      return snap.data().portfolio
    }

    // 2. Fallback check: users/{userId}/portfolio/data
    const subDocRef = doc(db, 'users', userId, 'portfolio', 'data')
    const subSnap = await getDoc(subDocRef)
    if (subSnap.exists()) {
      return subSnap.data()
    }

    return null
  } catch (err) {
    console.warn('Firestore mobile load error:', err)
    return null
  }
}
