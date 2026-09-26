import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import {
  Phone,
  User as UserIcon,
  Calendar,
  Lock,
  RefreshCw,
  LogOut,
  Edit3,
  Check,
  X
} from 'lucide-react-native'
import { logoutMobile, sendMobilePasswordReset } from '../firebaseConfig'

export default function SettingsScreen({ user, portfolio, onUpdateProfile, onForceSync, onLogout }) {
  const email = user?.email || 'N/A'
  const displayName = user?.displayName || portfolio?.profile?.name || 'Investor'
  const uid = user?.uid || 'Local'
  const phone = portfolio?.profile?.phone || ''
  const gender = portfolio?.profile?.gender || 'Male'
  const dob = portfolio?.profile?.dob || ''

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState(displayName)
  const [editPhone, setEditPhone] = useState(phone)
  const [editGender, setEditGender] = useState(gender)
  const [editDob, setEditDob] = useState(dob)
  const [resetSending, setResetSending] = useState(false)

  function openEditProfile() {
    setEditName(displayName)
    setEditPhone(phone)
    setEditGender(gender)
    setEditDob(dob)
    setIsEditModalOpen(true)
  }

  function handleSaveProfile() {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.')
      return
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        gender: editGender,
        dob: editDob.trim()
      })
    }

    setIsEditModalOpen(false)
    Alert.alert('Profile Updated', 'Your profile details have been updated successfully.')
  }

  async function handleSendResetPassword() {
    if (!email || email === 'N/A') {
      Alert.alert('Error', 'No registered email found for this account.')
      return
    }

    setResetSending(true)
    try {
      await sendMobilePasswordReset(email)
      Alert.alert(
        'Password Reset Dispatched',
        `A password reset link has been dispatched to ${email}. Check your inbox and spam folder.`
      )
    } catch (err) {
      Alert.alert('Password Reset Error', err.message || 'Failed to dispatch reset email.')
    } finally {
      setResetSending(false)
    }
  }

  function handleLogoutPress() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Portfolio CRM?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMobile()
              if (onLogout) onLogout()
            } catch (err) {
              console.warn('Logout error', err)
            }
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Profile</Text>
        <Text style={styles.headerSub}>Manage your profile credentials and cloud sync</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            {portfolio?.profile?.avatar ? (
              <Image source={{ uri: portfolio.profile.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{(displayName || 'VJ').slice(0, 2).toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={openEditProfile}
            activeOpacity={0.7}
          >
            <Edit3 size={16} color="#f97316" />
          </TouchableOpacity>
        </View>

        {(phone || gender || dob) ? (
          <View style={styles.badgesRow}>
            {phone ? (
              <View style={styles.badgeItem}>
                <Phone size={12} color="#94a3b8" />
                <Text style={styles.badgeText}>{phone}</Text>
              </View>
            ) : null}
            {gender ? (
              <View style={styles.badgeItem}>
                <UserIcon size={12} color="#94a3b8" />
                <Text style={styles.badgeText}>{gender}</Text>
              </View>
            ) : null}
            {dob ? (
              <View style={styles.badgeItem}>
                <Calendar size={12} color="#94a3b8" />
                <Text style={styles.badgeText}>{dob}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.profileActions}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={openEditProfile}
            activeOpacity={0.7}
          >
            <Edit3 size={14} color="#cbd5e1" style={{ marginRight: 6 }} />
            <Text style={styles.btnSecondaryText}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleSendResetPassword}
            disabled={resetSending}
            activeOpacity={0.7}
          >
            <Lock size={14} color="#cbd5e1" style={{ marginRight: 6 }} />
            <Text style={styles.btnSecondaryText}>
              {resetSending ? 'Sending...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cloud Sync Status */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>CLOUD FIRESTORE SYNC</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.syncRow}>
          <View style={styles.syncDot} />
          <Text style={styles.syncStatus}>Connected to vishnucrm-90dcc</Text>
        </View>
        <Text style={styles.syncDetail}>Account UID: {uid.slice(0, 16)}...</Text>
        <Text style={styles.syncDetail}>Sync Path: users/{'{uid}'}</Text>

        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => {
            if (onForceSync) onForceSync()
            Alert.alert('Sync Dispatched', 'Portfolio data synchronized with Firebase Cloud Firestore.')
          }}
          activeOpacity={0.7}
        >
          <RefreshCw size={15} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.syncButtonText}>Sync Now with Cloud</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>APPLICATION DETAILS</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoVal}>Android Native (Expo SDK 51)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoVal}>1.0.0 Production</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Encryption</Text>
          <Text style={styles.infoVal}>Firebase Auth + TLS 1.3</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogoutPress}
        activeOpacity={0.7}
      >
        <LogOut size={16} color="#ef4444" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out of Portfolio CRM</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Portfolio CRM • Personal Wealth &amp; Investment Manager
      </Text>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Vishnu J"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>GENDER</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, editGender === g && styles.genderBtnActive]}
                  onPress={() => setEditGender(g)}
                >
                  <Text style={[styles.genderBtnText, editGender === g && styles.genderBtnTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>DATE OF BIRTH (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={editDob}
              onChangeText={setEditDob}
              placeholder="e.g. 1998-05-15"
              placeholderTextColor="#64748b"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
              >
                <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 20,
    marginTop: 10
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  headerSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  card: {
    backgroundColor: '#181b22',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 20
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#262b35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#374151'
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 17
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f97316'
  },
  displayName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff'
  },
  emailText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6
  },
  badgeText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500'
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262b35',
    paddingVertical: 10,
    borderRadius: 12
  },
  btnSecondaryText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600'
  },
  sectionTitleRow: {
    marginBottom: 8,
    marginLeft: 4
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8
  },
  syncStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff'
  },
  syncDetail: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#262b35'
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a1a1e',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ef444440',
    marginTop: 6
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700'
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
    marginTop: 24
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#181b22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262b35'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff'
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#0d0f14',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#262b35'
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0d0f14',
    borderWidth: 1,
    borderColor: '#262b35',
    alignItems: 'center'
  },
  genderBtnActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#f97316'
  },
  genderBtnText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600'
  },
  genderBtnTextActive: {
    color: '#f97316',
    fontWeight: '700'
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    marginBottom: 10
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#262b35',
    alignItems: 'center'
  },
  modalCancelText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 13
  },
  modalSaveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#f97316'
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  }
})
