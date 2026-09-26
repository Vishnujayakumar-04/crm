import React, { useState, useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { fmtINR, computeCashFlowSummary } from '../utils/calculations'

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Entertainment',
  'Personal',
  'Family',
  'EMI / Loans',
  'Other'
]

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Interest',
  'Dividend',
  'Bonus',
  'Other'
]

const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
]

const CATEGORY_COLORS = {
  Food: '#f97316',
  Rent: '#ef4444',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Healthcare: '#10b981',
  Education: '#8b5cf6',
  Entertainment: '#06b6d4',
  Personal: '#f59e0b',
  Family: '#14b8a6',
  'EMI / Loans': '#6366f1',
  Other: '#64748b'
}

export default function ExpensesScreen({
  portfolio,
  onSaveExpense,
  onDeleteExpense,
  onSaveIncome,
  onDeleteIncome
}) {
  const expenses = portfolio?.expenses || []
  const income = portfolio?.income || []

  const [period, setPeriod] = useState('This Month')
  const [activeTab, setActiveTab] = useState('expenses') // 'expenses' or 'income'
  const [search, setSearch] = useState('')

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0])
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0])
  const [expenseDesc, setExpenseDesc] = useState('')
  const [expensePayment, setExpensePayment] = useState('UPI')

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeCategory, setIncomeCategory] = useState(INCOME_CATEGORIES[0])
  const [incomeDate, setIncomeDate] = useState(() => new Date().toISOString().split('T')[0])
  const [incomeDesc, setIncomeDesc] = useState('')

  // Summary
  const cashFlow = useMemo(() => {
    return computeCashFlowSummary(income, expenses, period)
  }, [income, expenses, period])

  // Filtered lists
  const filteredExpenses = useMemo(() => {
    let list = cashFlow.filteredExpenses
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      )
    }
    return list
  }, [cashFlow.filteredExpenses, search])

  const filteredIncome = useMemo(() => {
    let list = cashFlow.filteredIncome
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.description?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q)
      )
    }
    return list
  }, [cashFlow.filteredIncome, search])

  // Expense Modal open
  function handleOpenAddExpense(item = null) {
    if (item) {
      setEditingExpense(item)
      setExpenseAmount(String(item.amount || ''))
      setExpenseCategory(item.category || EXPENSE_CATEGORIES[0])
      setExpenseDate(item.date || new Date().toISOString().split('T')[0])
      setExpenseDesc(item.description || '')
      setExpensePayment(item.paymentMethod || 'UPI')
    } else {
      setEditingExpense(null)
      setExpenseAmount('')
      setExpenseCategory(EXPENSE_CATEGORIES[0])
      setExpenseDate(new Date().toISOString().split('T')[0])
      setExpenseDesc('')
      setExpensePayment('UPI')
    }
    setIsExpenseModalOpen(true)
  }

  function handleSaveExpenseSubmit() {
    const amt = parseFloat(expenseAmount)
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Validation Error', 'Amount must be greater than ₹0.')
      return
    }
    if (!expenseDate) {
      Alert.alert('Validation Error', 'Please select a valid date.')
      return
    }

    const payload = {
      id: editingExpense?.id || 'exp_' + Date.now(),
      amount: amt,
      category: expenseCategory,
      date: expenseDate,
      description: expenseDesc.trim(),
      paymentMethod: expensePayment,
      updatedAt: new Date().toISOString()
    }

    onSaveExpense(payload)
    setIsExpenseModalOpen(false)
  }

  function handleDeleteExpenseItem(item) {
    Alert.alert(
      'Delete Expense',
      `Delete expense of ${fmtINR(item.amount)} for ${item.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteExpense(item.id) }
      ]
    )
  }

  // Income Modal open
  function handleOpenAddIncome(item = null) {
    if (item) {
      setEditingIncome(item)
      setIncomeAmount(String(item.amount || ''))
      setIncomeCategory(item.category || INCOME_CATEGORIES[0])
      setIncomeDate(item.date || new Date().toISOString().split('T')[0])
      setIncomeDesc(item.description || '')
    } else {
      setEditingIncome(null)
      setIncomeAmount('')
      setIncomeCategory(INCOME_CATEGORIES[0])
      setIncomeDate(new Date().toISOString().split('T')[0])
      setIncomeDesc('')
    }
    setIsIncomeModalOpen(true)
  }

  function handleSaveIncomeSubmit() {
    const amt = parseFloat(incomeAmount)
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Validation Error', 'Amount must be greater than ₹0.')
      return
    }

    const payload = {
      id: editingIncome?.id || 'inc_' + Date.now(),
      amount: amt,
      category: incomeCategory,
      date: incomeDate,
      description: incomeDesc.trim(),
      updatedAt: new Date().toISOString()
    }

    onSaveIncome(payload)
    setIsIncomeModalOpen(false)
  }

  function handleDeleteIncomeItem(item) {
    Alert.alert(
      'Delete Income',
      `Delete income of ${fmtINR(item.amount)} from ${item.category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteIncome(item.id) }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Expenses &amp; Cash Flow</Text>
            <Text style={styles.subtitle}>Track daily spending and cash inflows</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addBtnSmall}
              onPress={() => handleOpenAddIncome()}
            >
              <Text style={styles.addBtnSmallText}>+ Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnPrimary}
              onPress={() => handleOpenAddExpense()}
            >
              <Text style={styles.addBtnPrimaryText}>+ Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {['This Month', 'Last Month', '3 Months', 'All'].map((p) => {
            const active = period === p
            return (
              <TouchableOpacity
                key={p}
                style={[styles.periodChip, active && styles.periodChipActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>CASH FLOW SUMMARY ({period.toUpperCase()})</Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryIncome}>{fmtINR(cashFlow.totalIncome)}</Text>
            </View>

            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryExpense}>{fmtINR(cashFlow.totalExpenses)}</Text>
            </View>

            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text
                style={[
                  styles.summaryRemaining,
                  { color: cashFlow.remaining >= 0 ? '#ffffff' : '#ef4444' }
                ]}
              >
                {fmtINR(cashFlow.remaining)}
              </Text>
            </View>
          </View>

          <View style={styles.savingsRateRow}>
            <Text style={styles.savingsRateLabel}>Savings Rate</Text>
            <Text style={styles.savingsRateVal}>{cashFlow.savingsRate.toFixed(1)}%</Text>
          </View>
        </View>

        {/* List Switcher & Search */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'expenses' && styles.tabBtnActive]}
            onPress={() => setActiveTab('expenses')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'expenses' && styles.tabBtnTextActive]}>
              Expenses ({filteredExpenses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'income' && styles.tabBtnActive]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'income' && styles.tabBtnTextActive]}>
              Income ({filteredIncome.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />

        {/* Expense or Income Cards List */}
        {activeTab === 'expenses' ? (
          filteredExpenses.length > 0 ? (
            filteredExpenses.map((item) => {
              const color = CATEGORY_COLORS[item.category] || '#64748b'
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={[styles.catBadge, { backgroundColor: `${color}20` }]}>
                        <Text style={[styles.catBadgeText, { color }]}>{item.category}</Text>
                      </View>
                      <Text style={styles.cardDesc} numberOfLines={1}>
                        {item.description || item.category}
                      </Text>
                      <Text style={styles.cardDate}>
                        {item.date} • {item.paymentMethod || 'UPI'}
                      </Text>
                    </View>

                    <Text style={styles.cardAmountExpense}>-{fmtINR(item.amount)}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleOpenAddExpense(item)}
                    >
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtnDelete}
                      onPress={() => handleDeleteExpenseItem(item)}
                    >
                      <Text style={styles.actionBtnTextDelete}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No expenses recorded yet</Text>
              <Text style={styles.emptySub}>
                Track your spending to understand where your money goes.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => handleOpenAddExpense()}
              >
                <Text style={styles.emptyBtnText}>+ Add Expense</Text>
              </TouchableOpacity>
            </View>
          )
        ) : filteredIncome.length > 0 ? (
          filteredIncome.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={[styles.catBadge, { backgroundColor: '#10b98120' }]}>
                    <Text style={[styles.catBadgeText, { color: '#10b981' }]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={styles.cardDesc} numberOfLines={1}>
                    {item.description || item.category}
                  </Text>
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>

                <Text style={styles.cardAmountIncome}>+{fmtINR(item.amount)}</Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleOpenAddIncome(item)}
                >
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnDelete}
                  onPress={() => handleDeleteIncomeItem(item)}
                >
                  <Text style={styles.actionBtnTextDelete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No income records yet</Text>
            <Text style={styles.emptySub}>
              Log salary, dividends, or freelance income.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: '#10b981' }]}
              onPress={() => handleOpenAddIncome()}
            >
              <Text style={styles.emptyBtnText}>+ Add Income</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Expense Modal */}
      <Modal visible={isExpenseModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </Text>

            <Text style={styles.inputLabel}>Amount (₹) *</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 1500"
              placeholderTextColor="#64748b"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />

            <Text style={styles.inputLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsRow}>
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = expenseCategory === cat
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => setExpenseCategory(cat)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <Text style={styles.inputLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsRow}>
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = expensePayment === pm
                return (
                  <TouchableOpacity
                    key={pm}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => setExpensePayment(pm)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {pm}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <Text style={styles.inputLabel}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="2026-09-26"
              placeholderTextColor="#64748b"
              value={expenseDate}
              onChangeText={setExpenseDate}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Grocery shopping"
              placeholderTextColor="#64748b"
              value={expenseDesc}
              onChangeText={setExpenseDesc}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsExpenseModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveExpenseSubmit}
              >
                <Text style={styles.modalSubmitText}>Save Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add / Edit Income Modal */}
      <Modal visible={isIncomeModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIncome ? 'Edit Income' : 'Record New Income'}
            </Text>

            <Text style={styles.inputLabel}>Amount (₹) *</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 50000"
              placeholderTextColor="#64748b"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
            />

            <Text style={styles.inputLabel}>Source *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChipsRow}>
              {INCOME_CATEGORIES.map((cat) => {
                const isSelected = incomeCategory === cat
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => setIncomeCategory(cat)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <Text style={styles.inputLabel}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="2026-09-26"
              placeholderTextColor="#64748b"
              value={incomeDate}
              onChangeText={setIncomeDate}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Salary credited"
              placeholderTextColor="#64748b"
              value={incomeDesc}
              onChangeText={setIncomeDesc}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsIncomeModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#10b981' }]}
                onPress={handleSaveIncomeSubmit}
              >
                <Text style={styles.modalSubmitText}>Save Income</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  addBtnSmall: {
    backgroundColor: '#181b22',
    borderWidth: 1,
    borderColor: '#262b35',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10
  },
  addBtnSmallText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700'
  },
  addBtnPrimary: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },
  addBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#181b22',
    borderWidth: 1,
    borderColor: '#262b35'
  },
  periodChipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316'
  },
  periodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  },
  periodChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  summaryCard: {
    backgroundColor: '#181b22',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 16
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 12
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  summaryCol: {
    flex: 1
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4
  },
  summaryIncome: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10b981'
  },
  summaryExpense: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f97316'
  },
  summaryRemaining: {
    fontSize: 16,
    fontWeight: '800'
  },
  savingsRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#262b35'
  },
  savingsRateLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600'
  },
  savingsRateVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f97316'
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#181b22',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9
  },
  tabBtnActive: {
    backgroundColor: '#262b35'
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  searchInput: {
    backgroundColor: '#181b22',
    borderWidth: 1,
    borderColor: '#262b35',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 14
  },
  card: {
    backgroundColor: '#181b22',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 10
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2
  },
  cardDate: {
    fontSize: 11,
    color: '#64748b'
  },
  cardAmountExpense: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f97316'
  },
  cardAmountIncome: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10b981'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316'
  },
  actionBtnDelete: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  actionBtnTextDelete: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444'
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 240,
    marginBottom: 16
  },
  emptyBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    marginTop: 4
  },
  modalInput: {
    backgroundColor: '#0d0f14',
    borderWidth: 1,
    borderColor: '#262b35',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 10
  },
  catChipsRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  catChip: {
    backgroundColor: '#0d0f14',
    borderWidth: 1,
    borderColor: '#262b35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6
  },
  catChipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316'
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#262b35'
  },
  modalCancelText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f97316'
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  }
})
