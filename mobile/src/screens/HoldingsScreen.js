import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native'
import { fmtINR, fmtPercent } from '../utils/calculations'

export default function HoldingsScreen({ portfolio, onSaveHolding, onDeleteHolding }) {
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [modalVisible, setModalVisible] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [type, setType] = useState('EQUITY')
  const [qty, setQty] = useState('')
  const [buy, setBuy] = useState('')
  const [current, setCurrent] = useState('')
  const [editingId, setEditingId] = useState(null)

  const rawHoldings = portfolio?.holdings || []

  const filteredHoldings = rawHoldings.filter((h) => {
    const matchesFilter = filter === 'ALL' || h.type === filter
    const matchesSearch =
      !search.trim() ||
      (h.name && h.name.toLowerCase().includes(search.toLowerCase())) ||
      (h.ticker && h.ticker.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Calculate totals
  let totalInvested = 0
  let totalCurrent = 0
  filteredHoldings.forEach((h) => {
    const q = parseFloat(h.qty) || 0
    const b = parseFloat(h.buy) || 0
    const c = parseFloat(h.current) || b
    totalInvested += q * b
    totalCurrent += q * c
  })
  const totalPnl = totalCurrent - totalInvested
  const pnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
  const isPositive = totalPnl >= 0

  function openAddModal() {
    setEditingId(null)
    setName('')
    setTicker('')
    setType('EQUITY')
    setQty('')
    setBuy('')
    setCurrent('')
    setModalVisible(true)
  }

  function openEditModal(h) {
    setEditingId(h.id)
    setName(h.name || '')
    setTicker(h.ticker || '')
    setType(h.type || 'EQUITY')
    setQty(String(h.qty || ''))
    setBuy(String(h.buy || ''))
    setCurrent(String(h.current || ''))
    setModalVisible(true)
  }

  function handleSave() {
    if (!name.trim()) return
    const newHolding = {
      id: editingId || 'h_' + Date.now(),
      name: name.trim(),
      ticker: (ticker || name.slice(0, 4)).trim().toUpperCase(),
      type,
      qty: parseFloat(qty) || 1,
      buy: parseFloat(buy) || 0,
      current: parseFloat(current) || parseFloat(buy) || 0
    }
    onSaveHolding(newHolding)
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Holdings &amp; Equities</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>CURRENT VALUE</Text>
          <Text style={styles.summaryValue}>{fmtINR(totalCurrent)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>TOTAL P&amp;L</Text>
          <Text style={[styles.summaryValue, isPositive ? styles.pnlPos : styles.pnlNeg]}>
            {isPositive ? '+' : ''}{fmtINR(totalPnl)} ({fmtPercent(pnlPercent)})
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        {['ALL', 'EQUITY', 'MF'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
              {cat === 'ALL' ? 'All Assets' : cat === 'EQUITY' ? 'Stocks' : 'Mutual Funds'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ticker..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Holdings List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredHoldings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No investments found matching criteria.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
              <Text style={styles.emptyAddText}>+ Add First Holding</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredHoldings.map((h) => {
            const q = parseFloat(h.qty) || 0
            const b = parseFloat(h.buy) || 0
            const c = parseFloat(h.current) || b
            const invested = q * b
            const curVal = q * c
            const pnl = curVal - invested
            const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
            const pos = pnl >= 0

            return (
              <TouchableOpacity
                key={h.id}
                style={styles.card}
                onPress={() => openEditModal(h)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleBox}>
                    <Text style={styles.ticker}>{h.ticker || h.name}</Text>
                    <Text style={styles.name} numberOfLines={1}>{h.name}</Text>
                  </View>
                  <View style={[styles.typeBadge, h.type === 'MF' ? styles.mfBadge : styles.eqBadge]}>
                    <Text style={styles.typeText}>{h.type === 'MF' ? 'Mutual Fund' : 'Stock'}</Text>
                  </View>
                </View>

                <View style={styles.cardMid}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Qty: {q}</Text>
                    <Text style={styles.detailSub}>Avg: {fmtINR(b)}</Text>
                  </View>
                  <View style={styles.detailColRight}>
                    <Text style={styles.detailValue}>{fmtINR(curVal)}</Text>
                    <Text style={[styles.detailPnl, pos ? styles.pnlPos : styles.pnlNeg]}>
                      {pos ? '+' : ''}{fmtINR(pnl)} ({fmtPercent(pnlPct)})
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Investment' : 'Add Investment'}</Text>

            <Text style={styles.modalLabel}>TYPE</Text>
            <View style={styles.modalTypeRow}>
              <TouchableOpacity
                style={[styles.typeOpt, type === 'EQUITY' && styles.typeOptActive]}
                onPress={() => setType('EQUITY')}
              >
                <Text style={[styles.typeOptText, type === 'EQUITY' && styles.typeOptTextActive]}>
                  Equity / Stock
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOpt, type === 'MF' && styles.typeOptActive]}
                onPress={() => setType('MF')}
              >
                <Text style={[styles.typeOptText, type === 'MF' && styles.typeOptTextActive]}>
                  Mutual Fund
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>ASSET NAME</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Reliance Industries"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.modalLabel}>TICKER / SYMBOL</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. RELIANCE"
              placeholderTextColor="#64748b"
              value={ticker}
              onChangeText={setTicker}
              autoCapitalize="characters"
            />

            <View style={styles.modalRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalLabel}>QUANTITY</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 50"
                  placeholderTextColor="#64748b"
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>BUY PRICE (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2400"
                  placeholderTextColor="#64748b"
                  value={buy}
                  onChangeText={setBuy}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.modalLabel}>CURRENT PRICE (₹)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2580"
              placeholderTextColor="#64748b"
              value={current}
              onChangeText={setCurrent}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              {editingId && (
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={() => {
                    Alert.alert(
                      'Delete Investment',
                      `Are you sure you want to delete ${name || 'this asset'} from your portfolio? This action cannot be undone.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            onDeleteHolding(editingId)
                            setModalVisible(false)
                          }
                        }
                      ]
                    )
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
    backgroundColor: '#f97316',
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
    backgroundColor: '#f97316',
    borderColor: '#f97316'
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
  searchBox: {
    paddingHorizontal: 20,
    marginBottom: 14
  },
  searchInput: {
    backgroundColor: '#181b22',
    borderWidth: 1,
    borderColor: '#262b35',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#ffffff'
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
    backgroundColor: '#f97316',
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
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitleBox: {
    flex: 1,
    marginRight: 8
  },
  ticker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  },
  name: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  eqBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)'
  },
  mfBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)'
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f97316'
  },
  cardMid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailCol: {},
  detailColRight: {
    alignItems: 'flex-end'
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1'
  },
  detailSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  detailPnl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  pnlPos: {
    color: '#10b981'
  },
  pnlNeg: {
    color: '#ef4444'
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
    backgroundColor: '#f97316',
    borderColor: '#f97316'
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
    backgroundColor: '#f97316',
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
