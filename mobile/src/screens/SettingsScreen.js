import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native'
import { logoutMobile } from '../firebaseConfig'

export default function SettingsScreen({ user, portfolio, onForceSync, onLogout }) {
  const email = user?.email || 'N/A'
  const displayName = user?.displayName || portfolio?.profile?.name || 'Investor'
  const uid = user?.uid || 'Local'

  async function handleLogoutPress() {
    try {
      await logoutMobile()
      if (onLogout) onLogout()
    } catch (err) {
      console.warn('Logout error', err)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings &amp; Profile</Text>
        <Text style={styles.headerSub}>Manage security and account sync</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(displayName || 'IN').slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
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
        <Text style={styles.syncDetail}>Sync Path: users/{'{uid}'}/portfolio/data</Text>

        <TouchableOpacity style={styles.syncButton} onPress={onForceSync}>
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
        <Text style={styles.logoutText}>Sign Out of Portfolio CRM</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Portfolio CRM • Personal Wealth &amp; Investment Manager
      </Text>
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
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 16
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff'
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  emailText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  sectionTitleRow: {
    marginBottom: 8,
    marginLeft: 4
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.6
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
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
    color: '#10b981'
  },
  syncDetail: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4
  },
  syncButton: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f97316'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
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
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13
  },
  footerNote: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 11,
    marginTop: 24
  }
})
