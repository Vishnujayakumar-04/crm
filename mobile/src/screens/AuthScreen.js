import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import { loginMobile, signupMobile, sendMobilePasswordReset } from '../firebaseConfig'

export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgot, setIsForgot] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  async function handleAction() {
    setError('')

    if (isForgot) {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid registered email address.')
        return
      }
      setLoading(true)
      try {
        await sendMobilePasswordReset(email)
        setResetSent(true)
      } catch (err) {
        setError(err.message || 'Failed to send reset link.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError('Please enter your full name.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        const user = await loginMobile(email, password)
        if (onAuthSuccess) onAuthSuccess(user)
      } else {
        const user = await signupMobile(email, password, fullName)
        if (onAuthSuccess) onAuthSuccess(user)
      }
    } catch (err) {
      const code = err.code || ''
      if (code.includes('configuration-not-found') || code.includes('operation-not-allowed')) {
        setError(
          'Firebase Email/Password provider is disabled in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Email/Password and toggle to Enabled.'
        )
      } else if (code.includes('email-already-in-use')) {
        setError('An account with this email already exists. Please log in.')
      } else if (code.includes('wrong-password') || code.includes('invalid-credential')) {
        setError('Incorrect email or password. Please verify your credentials.')
      } else if (code.includes('user-not-found')) {
        setError('No account found with this email. Please sign up.')
      } else {
        setError(err.message || 'Authentication failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Branding Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>P·</Text>
          </View>
          <Text style={styles.brandTitle}>Portfolio CRM</Text>
          <Text style={styles.brandSubtitle}>Personal Wealth &amp; Investment Manager</Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          {/* Segmented Switcher */}
          {!isForgot && (
            <View style={styles.tabSwitchContainer}>
              <TouchableOpacity
                onPress={() => { setIsLogin(true); setError('') }}
                style={[styles.tabButton, isLogin && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, isLogin && styles.tabButtonTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setIsLogin(false); setError('') }}
                style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, !isLogin && styles.tabButtonTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isForgot && (
            <View style={styles.forgotHeader}>
              <Text style={styles.formTitle}>Reset Password</Text>
              <Text style={styles.formSubtitle}>
                Enter your email address to receive reset instructions.
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Success Banner for Password Reset */}
          {resetSent ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Password reset link sent to {email}. Check your inbox or spam folder.
              </Text>
            </View>
          ) : null}

          {/* Full Name for Signup */}
          {!isLogin && !isForgot && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex Sharma"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password (if not forgot) */}
          {!isForgot && (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                {isLogin && (
                  <TouchableOpacity onPress={() => { setIsForgot(true); setError('') }}>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 45 }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Confirm Password for Signup */}
          {!isLogin && !isForgot && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleAction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In to Portfolio' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Forgot Password */}
          {isForgot && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => { setIsForgot(false); setError(''); setResetSent(false) }}
            >
              <Text style={styles.cancelButtonText}>Return to Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer info */}
        <Text style={styles.footerNote}>
          Encrypted with Firebase Security • Cross-device sync enabled
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff'
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#181b22',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262b35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#0d0f14',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  tabButtonActive: {
    backgroundColor: '#f97316'
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8'
  },
  tabButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  forgotHeader: {
    marginBottom: 16
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff'
  },
  formSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 18
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  successText: {
    color: '#6ee7b7',
    fontSize: 12,
    lineHeight: 18
  },
  inputGroup: {
    marginBottom: 16
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316'
  },
  input: {
    backgroundColor: '#0d0f14',
    borderWidth: 1,
    borderColor: '#2d3340',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff'
  },
  passwordWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center'
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4
  },
  eyeText: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#f97316',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  footerNote: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 11,
    marginTop: 24
  }
})
