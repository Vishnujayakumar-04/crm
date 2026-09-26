import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  onMobileAuthChange,
  saveMobilePortfolio,
  loadMobilePortfolio
} from './src/firebaseConfig'
import AuthScreen from './src/screens/AuthScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import HoldingsScreen from './src/screens/HoldingsScreen'
import SavingsScreen from './src/screens/SavingsScreen'
import AllocationScreen from './src/screens/AllocationScreen'
import ExpensesScreen from './src/screens/ExpensesScreen'
import SettingsScreen from './src/screens/SettingsScreen'

const DEFAULT_PORTFOLIO = {
  profile: { name: 'Investor' },
  holdings: [],
  savings: [],
  expenses: [],
  income: [],
  activities: []
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('Dashboard')
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO)
  const [refreshing, setRefreshing] = useState(false)

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onMobileAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // 1. Try to load local cached data
        try {
          const cached = await AsyncStorage.getItem(`portfolio_${firebaseUser.uid}`)
          if (cached) {
            setPortfolio(JSON.parse(cached))
          }
        } catch (e) {
          console.warn('AsyncStorage read error', e)
        }

        // 2. Sync with Cloud Firestore
        try {
          const cloudData = await loadMobilePortfolio(firebaseUser.uid)
          if (cloudData && (cloudData.holdings?.length > 0 || cloudData.savings?.length > 0)) {
            setPortfolio(cloudData)
            await AsyncStorage.setItem(`portfolio_${firebaseUser.uid}`, JSON.stringify(cloudData))
          }
        } catch (e) {
          console.warn('Cloud sync on login error', e)
        }
      } else {
        setPortfolio(DEFAULT_PORTFOLIO)
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Auto-save whenever portfolio data changes
  async function updatePortfolio(updater) {
    setPortfolio((curr) => {
      const updated = typeof updater === 'function' ? updater(curr) : updater
      if (user?.uid) {
        AsyncStorage.setItem(`portfolio_${user.uid}`, JSON.stringify(updated)).catch(() => {})
        saveMobilePortfolio(user.uid, updated).catch(() => {})
      }
      return updated
    })
  }

  // Refresh handler (pull to refresh or cloud sync button)
  async function handleRefresh() {
    if (!user?.uid) return
    setRefreshing(true)
    try {
      const cloudData = await loadMobilePortfolio(user.uid)
      if (cloudData) {
        setPortfolio(cloudData)
        await AsyncStorage.setItem(`portfolio_${user.uid}`, JSON.stringify(cloudData))
      }
    } catch (e) {
      console.warn('Refresh error', e)
    } finally {
      setRefreshing(false)
    }
  }

  // Holdings actions
  function handleSaveHolding(holding) {
    updatePortfolio((curr) => {
      const exists = (curr.holdings || []).some((h) => h.id === holding.id)
      const newHoldings = exists
        ? curr.holdings.map((h) => (h.id === holding.id ? holding : h))
        : [holding, ...(curr.holdings || [])]

      const act = {
        id: 'act_' + Date.now(),
        type: exists ? 'UPDATE' : 'BUY',
        title: `${exists ? 'Updated' : 'Added'} ${holding.name}`,
        details: `${holding.qty} units @ ₹${holding.buy}`,
        amount: (holding.qty || 1) * (holding.buy || 0),
        time: 'Just now',
        status: 'Completed'
      }

      return {
        ...curr,
        holdings: newHoldings,
        activities: [act, ...(curr.activities || [])].slice(0, 20)
      }
    })
  }

  function handleDeleteHolding(id) {
    updatePortfolio((curr) => ({
      ...curr,
      holdings: (curr.holdings || []).filter((h) => h.id !== id)
    }))
  }

  // Savings actions
  function handleSaveSaving(saving) {
    updatePortfolio((curr) => {
      const exists = (curr.savings || []).some((s) => s.id === saving.id)
      const newSavings = exists
        ? curr.savings.map((s) => (s.id === saving.id ? saving : s))
        : [saving, ...(curr.savings || [])]

      const act = {
        id: 'act_' + Date.now(),
        type: 'SAVINGS',
        title: `${exists ? 'Updated' : 'Created'} ${saving.name}`,
        details: `${saving.type}${saving.interest ? ` @ ${saving.interest}% p.a.` : ''}`,
        amount: saving.amount,
        time: 'Just now',
        status: 'Completed'
      }

      return {
        ...curr,
        savings: newSavings,
        activities: [act, ...(curr.activities || [])].slice(0, 20)
      }
    })
  }

  function handleDeleteSaving(id) {
    updatePortfolio((curr) => ({
      ...curr,
      savings: (curr.savings || []).filter((s) => s.id !== id)
    }))
  }

  // Expense actions
  function handleSaveExpense(expense) {
    updatePortfolio((curr) => {
      const exists = (curr.expenses || []).some((e) => e.id === expense.id)
      const newExpenses = exists
        ? curr.expenses.map((e) => (e.id === expense.id ? expense : e))
        : [expense, ...(curr.expenses || [])]

      const act = {
        id: 'act_' + Date.now(),
        type: 'EXPENSE',
        title: `${exists ? 'Updated' : 'Added'} ${expense.category || 'Expense'}`,
        details: expense.notes || expense.paymentMethod || 'Expense',
        amount: parseFloat(expense.amount) || 0,
        time: 'Just now',
        status: 'Completed'
      }

      return {
        ...curr,
        expenses: newExpenses,
        activities: [act, ...(curr.activities || [])].slice(0, 20)
      }
    })
  }

  function handleDeleteExpense(id) {
    updatePortfolio((curr) => ({
      ...curr,
      expenses: (curr.expenses || []).filter((e) => e.id !== id)
    }))
  }

  // Income actions
  function handleSaveIncome(inc) {
    updatePortfolio((curr) => {
      const exists = (curr.income || []).some((i) => i.id === inc.id)
      const newIncome = exists
        ? curr.income.map((i) => (i.id === inc.id ? inc : i))
        : [inc, ...(curr.income || [])]

      const act = {
        id: 'act_' + Date.now(),
        type: 'INCOME',
        title: `${exists ? 'Updated' : 'Added'} ${inc.source || inc.category || 'Income'}`,
        details: inc.notes || 'Income Credited',
        amount: parseFloat(inc.amount) || 0,
        time: 'Just now',
        status: 'Completed'
      }

      return {
        ...curr,
        income: newIncome,
        activities: [act, ...(curr.activities || [])].slice(0, 20)
      }
    })
  }

  function handleDeleteIncome(id) {
    updatePortfolio((curr) => ({
      ...curr,
      income: (curr.income || []).filter((i) => i.id !== id)
    }))
  }

  if (authLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0d0f14" />
        <View style={styles.splashBadge}>
          <Text style={styles.splashBadgeText}>P·</Text>
        </View>
        <Text style={styles.splashTitle}>Portfolio CRM</Text>
        <ActivityIndicator color="#f97316" style={{ marginTop: 16 }} />
      </View>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0d0f14" />
        <AuthScreen onAuthSuccess={(authUser) => setUser(authUser)} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0f14" />

      {/* Main Tab Screen Content */}
      <View style={styles.mainContent}>
        {currentTab === 'Dashboard' && (
          <DashboardScreen
            portfolio={portfolio}
            user={user}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}
        {currentTab === 'Holdings' && (
          <HoldingsScreen
            portfolio={portfolio}
            onSaveHolding={handleSaveHolding}
            onDeleteHolding={handleDeleteHolding}
          />
        )}
        {currentTab === 'Savings' && (
          <SavingsScreen
            portfolio={portfolio}
            onSaveSaving={handleSaveSaving}
            onDeleteSaving={handleDeleteSaving}
          />
        )}
        {currentTab === 'Allocation' && (
          <AllocationScreen portfolio={portfolio} />
        )}
        {currentTab === 'Expenses' && (
          <ExpensesScreen
            portfolio={portfolio}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            onSaveIncome={handleSaveIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}
        {(currentTab === 'Profile' || currentTab === 'Settings') && (
          <SettingsScreen
            user={user}
            portfolio={portfolio}
            onForceSync={handleRefresh}
            onLogout={() => setUser(null)}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        {[
          { id: 'Dashboard', label: 'Overview', icon: '🏠' },
          { id: 'Holdings', label: 'Holdings', icon: '📈' },
          { id: 'Savings', label: 'Savings', icon: '🏦' },
          { id: 'Allocation', label: 'Allocation', icon: '🥧' },
          { id: 'Expenses', label: 'Expenses', icon: '💳' },
          { id: 'Profile', label: 'Profile', icon: '👤' }
        ].map((tab) => {
          const isActive = currentTab === tab.id || (tab.id === 'Profile' && currentTab === 'Settings')
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setCurrentTab(tab.id)}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0f14'
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0d0f14',
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  splashBadgeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff'
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  mainContent: {
    flex: 1
  },
  bottomBar: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: '#181b22',
    borderTopWidth: 1,
    borderTopColor: '#262b35',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.5
  },
  tabIconActive: {
    opacity: 1
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8'
  },
  tabLabelActive: {
    color: '#f97316',
    fontWeight: '700'
  }
})
