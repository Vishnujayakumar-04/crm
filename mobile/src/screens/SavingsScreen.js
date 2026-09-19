import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal
} from 'react-native'
import { fmtINR, calcFDMaturity, getDaysRemaining } from '../utils/calculations'

export default function SavingsScreen({ portfolio, onSaveSaving, onDeleteSaving }) {
  const [filter, setFilter] = useState('ALL')
  const [modalVisible, setModalVisible] = useState(false)

  // Form state
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('FD')
  const [amount, setAmount] = useState('')
  const [interest, setInterest] = useState('')
  const [tenure, setTenure] = useState('12')
  const [maturityDate, setMaturityDate] = useState('')

  const rawSavings = portfolio?.savings || []

  const filteredSavings = rawSavings.filter((s) => {
    if (filter === 'ALL') return true
    if (filter === 'FD') return s.type === 'FD'
    return s.type !== 'FD'
  })

  // Calculate totals
  let liquidCash = 0
  let fdsPrincipal = 0
  let fdsMaturity = 0

  rawSavings.forEach((s) => {
    const val = parseFloat(s.amount) || 0
    if (s.type === 'FD') {
      fdsPrincipal += val
      const mat = s.maturityAmount ? parseFloat(s.maturityAmount) : calcFDMaturity(val, s.interest, s.tenure)
      fdsMaturity += mat
    } else {
      liquidCash += val
    }
  })

  function openAddModal() {
    setEditingId(null)
    setName('')
    setType('FD')
    setAmount('')
    setInterest('7.1')
    setTenure('12')
    setMaturityDate('')
    setModalVisible(true)
  }

  function openEditModal(s) {
    setEditingId(s.id)
    setName(s.name || '')
    setType(s.type || 'FD')
    setAmount(String(s.amount || ''))
    setInterest(String(s.interest || ''))
    setTenure(String(s.tenure || '12'))
    setMaturityDate(s.maturityDate || '')
    setModalVisible(true)
  }

  function handleSave() {
    if (!name.trim()) return
    const p = parseFloat(amount) || 0
    const r = parseFloat(interest) || 0
    const m = parseFloat(tenure) || 12
    const maturityAmount = type === 'FD' ? calcFDMaturity(p, r, m) : p

    const newSaving = {
      id: editingId || 's_' + Date.now(),
      name: name.trim(),
      type,
      amount: p,
      interest: r,
      tenure: m,
      maturityAmount,
      maturityDate: maturityDate || undefined
    }
    onSaveSaving(newSaving)
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings &amp; Fixed Deposits</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>TOTAL PRINCIPAL</Text>
          <Text style={styles.summaryValue}>{fmtINR(liquidCash + fdsPrincipal)}</Text>
          <Text style={styles.summarySub}>Cash: {fmtINR(liquidCash)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>EXPECTED MATURITY</Text>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>
            {fmtINR(liquidCash + fdsMaturity)}
          </Text>
          <Text style={styles.summarySub}>FD Gains: +{fmtINR(fdsMaturity - fdsPrincipal)}</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        {['ALL', 'FD', 'SAVINGS'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
              {cat === 'ALL' ? 'All Accounts' : cat === 'FD' ? 'Fixed Deposits' : 'Savings Accounts'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Savings & FD List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredSavings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No accounts or deposits added yet.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
              <Text style={styles.emptyAddText}>+ Add New Deposit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredSavings.map((s) => {
            const isFD = s.type === 'FD'
            const p = parseFloat(s.amount) || 0
            const r = parseFloat(s.interest) || 0
            const m = parseFloat(s.tenure) || 12
            const maturityVal = s.maturityAmount ? parseFloat(s.maturityAmount) : calcFDMaturity(p, r, m)
            const daysLeft = s.maturityDate ? getDaysRemaining(s.maturityDate) : null

            return (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() => openEditModal(s)}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{s.name}</Text>
                    <Text style={styles.cardType}>
                      {isFD ? `Fixed Deposit • ${r}% p.a.` : 'Savings Account'}
                    </Text>
                  </View>
                  <View style={[styles.typeBadge, isFD ? styles.fdBadge : styles.sbBadge]}>
                    <Text style={[styles.typeText, isFD ? { color: '#10b981' } : { color: '#3b82f6' }]}>
                      {isFD ? 'Quarterly Compounded' : 'Liquid Cash'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardStats}>
                  <View>
                    <Text style={styles.statLabel}>PRINCIPAL</Text>
                    <Text style={styles.statAmount}>{fmtINR(p)}</Text>
                  </View>
                  {isFD && (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.statLabel}>AT MATURITY</Text>
                      <Text style={[styles.statAmount, { color: '#10b981' }]}>{fmtINR(maturityVal)}</Text>
                    </View>
                  )}
                </View>

                {isFD && daysLeft !== null && (
                  <View style={styles.matRow}>
                    <Text style={styles.matDate}>
                      Maturity: {new Date(s.maturityDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.daysLeftBadge, daysLeft <= 30 && { color: '#f59e0b' }]}>
                      {daysLeft > 0 ? `${daysLeft} days remaining` : 'Matured'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Account / FD' : 'Add Deposit / Account'}</Text>

            <Text style={styles.modalLabel}>ACCOUNT TYPE</Text>
            <View style={styles.modalTypeRow}>
              <TouchableOpacity
                style={[styles.typeOpt, type === 'FD' && styles.typeOptActive]}
                onPress={() => setType('FD')}
              >
                <Text style={[styles.typeOptText, type === 'FD' && styles.typeOptTextActive]}>
                  Fixed Deposit (FD)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOpt, type === 'SAVINGS' && styles.typeOptActive]}
                onPress={() => setType('SAVINGS')}
              >
                <Text style={[styles.typeOptText, type === 'SAVINGS' && styles.typeOptTextActive]}>
                  Savings Bank
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>BANK / INSTITUTION NAME</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. HDFC Bank, SBI, ICICI"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.modalLabel}>PRINCIPAL AMOUNT (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 100000"
              placeholderTextColor="#64748b"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {type === 'FD' && (
              <>
                <View style={styles.modalRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.modalLabel}>INTEREST RATE (% p.a.)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 7.25"
                      placeholderTextColor="#64748b"
                      value={interest}
                      onChangeText={setInterest}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>TENURE (MONTHS)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 12"
                      placeholderTextColor="#64748b"
                      value={tenure}
                      onChangeText={setTenure}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.modalLabel}>MATURITY DATE (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2027-03-31"
                  placeholderTextColor="#64748b"
                  value={maturityDate}
                  onChangeText={setMaturityDate}
                />
              </>
            )}

            <View style={styles.modalActions}>
              {editingId && (
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={() => {
                    onDeleteSaving(editingId)
                    setModalVisible(false)
                  }}
                >
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSave}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#181b22',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 14
  },
  summaryCol: {
    flex: 1
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#262b35',
    marginHorizontal: 12
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  summarySub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#181b22',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#262b35'
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8'
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 14
  },
  emptyAddBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  emptyAddText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  card: {
    backgroundColor: '#181b22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 10
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  },
  cardType: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  fdBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  sbBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#262b35',
    marginVertical: 12
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600'
  },
  statAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2
  },
  matRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  matDate: {
    fontSize: 10,
    color: '#94a3b8'
  },
  daysLeftBadge: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#181b22',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262b35'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  modalTypeRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  typeOpt: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0d0f14',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#262b35'
  },
  typeOptActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  typeOptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8'
  },
  typeOptTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  modalInput: {
    backgroundColor: '#0d0f14',
    borderWidth: 1,
    borderColor: '#262b35',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 12
  },
  modalRow: {
    flexDirection: 'row'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13
  },
  modalDeleteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 'auto',
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  modalDeleteText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13
  },
  modalSaveBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  }
})
