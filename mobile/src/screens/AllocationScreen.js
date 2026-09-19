import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native'
import { fmtINR } from '../utils/calculations'

export default function AllocationScreen({ portfolio }) {
  const holdings = portfolio?.holdings || []
  const savings = portfolio?.savings || []

  let equityTotal = 0
  let mfTotal = 0

  holdings.forEach((h) => {
    const q = parseFloat(h.qty) || 0
    const val = q * (parseFloat(h.current) || parseFloat(h.buy) || 0)
    if (h.type === 'MF') {
      mfTotal += val
    } else {
      equityTotal += val
    }
  })

  let fdsTotal = 0
  let cashTotal = 0

  savings.forEach((s) => {
    const val = parseFloat(s.amount) || 0
    if (s.type === 'FD') {
      fdsTotal += val
    } else {
      cashTotal += val
    }
  })

  const total = equityTotal + mfTotal + fdsTotal + cashTotal || 1

  const eqPct = ((equityTotal / total) * 100).toFixed(1)
  const mfPct = ((mfTotal / total) * 100).toFixed(1)
  const fdPct = ((fdsTotal / total) * 100).toFixed(1)
  const cashPct = ((cashTotal / total) * 100).toFixed(1)

  const classes = [
    { name: 'Direct Equity / Stocks', amount: equityTotal, pct: eqPct, color: '#f97316', icon: '📈' },
    { name: 'Mutual Funds & ETFs', amount: mfTotal, pct: mfPct, color: '#3b82f6', icon: '📊' },
    { name: 'Fixed Deposits (Debt)', amount: fdsTotal, pct: fdPct, color: '#10b981', icon: '🔒' },
    { name: 'Liquid Savings & Cash', amount: cashTotal, pct: cashPct, color: '#eab308', icon: '💰' }
  ]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asset Allocation</Text>
        <Text style={styles.headerSub}>Portfolio Diversification &amp; Exposure</Text>
      </View>

      {/* Multi-segmented Visual Allocation Bar */}
      <View style={styles.barContainer}>
        <View style={styles.multiBar}>
          {classes.map((c, i) => {
            const flexVal = parseFloat(c.pct) || 0
            if (flexVal <= 0) return null
            return (
              <View
                key={i}
                style={[
                  styles.barSegment,
                  { backgroundColor: c.color, flex: flexVal }
                ]}
              />
            )
          })}
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL ASSETS</Text>
          <Text style={styles.totalValue}>{fmtINR(total)}</Text>
        </View>
      </View>

      {/* Breakdown Cards */}
      <View style={styles.cardsList}>
        {classes.map((c, i) => (
          <View key={i} style={styles.classCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={styles.className}>{c.name}</Text>
              </View>
              <Text style={[styles.classPct, { color: c.color }]}>{c.pct}%</Text>
            </View>

            {/* Individual Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(parseFloat(c.pct), 100)}%`, backgroundColor: c.color }
                ]}
              />
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.amountLabel}>ALLOCATION VALUE</Text>
              <Text style={styles.amountValue}>{fmtINR(c.amount)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Diversification Insight Card */}
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Diversification Health</Text>
        <Text style={styles.insightDesc}>
          {parseFloat(eqPct) + parseFloat(mfPct) > 75
            ? 'High Equity Exposure: Your portfolio is geared heavily towards market growth. Ensure you maintain sufficient emergency cash in Fixed Deposits.'
            : parseFloat(fdPct) + parseFloat(cashPct) > 60
            ? 'Conservative Allocation: Over 60% of your net worth is in cash and deposits. Consider SIP allocations in equities for long-term inflation beating returns.'
            : 'Well Balanced: You have an optimal split between growth assets (stocks & funds) and capital protection assets (fixed deposits).'}
        </Text>
      </View>
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
  barContainer: {
    backgroundColor: '#181b22',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 20
  },
  multiBar: {
    height: 18,
    borderRadius: 9,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#0d0f14',
    marginBottom: 14
  },
  barSegment: {
    height: '100%'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8'
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff'
  },
  cardsList: {
    marginBottom: 16
  },
  classCard: {
    backgroundColor: '#181b22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  className: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  },
  classPct: {
    fontSize: 13,
    fontWeight: '800'
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0d0f14',
    overflow: 'hidden',
    marginBottom: 10
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b'
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  insightCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)'
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f97316',
    marginBottom: 6
  },
  insightDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18
  }
})
