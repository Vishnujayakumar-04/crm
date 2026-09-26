import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native'
import { fmtINR, fmtPercent, computePortfolioSummary, computeCashFlowSummary } from '../utils/calculations'
import {
  TrendingUp,
  Landmark,
  PieChart,
  Receipt,
  RefreshCw,
  BarChart2,
  Wallet
} from 'lucide-react-native'

export default function DashboardScreen({
  portfolio,
  user,
  onRefresh,
  refreshing,
  onNavigateTab,
  onOpenAddHolding,
  onOpenAddSavings
}) {
  const holdings = portfolio?.holdings || []
  const savings = portfolio?.savings || []
  const expenses = portfolio?.expenses || []
  const income = portfolio?.income || []
  const activities = portfolio?.activities || []

  const summary = computePortfolioSummary(holdings, savings)
  const cashFlow = computeCashFlowSummary(expenses, income, 'month')
  const isPnlPositive = summary.totalPnl >= 0

  const userName = user?.displayName || portfolio?.profile?.name || 'Investor'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#f97316"
          colors={['#f97316']}
        />
      }
    >
      {/* Top Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
        <View style={styles.userAvatar}>
          {portfolio?.profile?.avatar ? (
            <Image source={{ uri: portfolio.profile.avatar }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>
              {(userName || 'VJ').slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* Main Net Worth Card */}
      <View style={styles.netWorthCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSubtitle}>TOTAL NET WORTH</Text>
          <View style={[styles.badge, isPnlPositive ? styles.badgeSuccess : styles.badgeDanger]}>
            <Text style={[styles.badgeText, isPnlPositive ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
              {fmtPercent(summary.pnlPercent)}
            </Text>
          </View>
        </View>

        <Text style={styles.netWorthAmount}>{fmtINR(summary.netWorth)}</Text>

        <View style={styles.cardDivider} />

        <View style={styles.cardStatsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>INVESTED</Text>
            <Text style={styles.statValue}>{fmtINR(summary.totalInvested)}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>TOTAL PROFIT / LOSS</Text>
            <Text style={[styles.statValue, isPnlPositive ? styles.pnlPositive : styles.pnlNegative]}>
              {isPnlPositive ? '+' : ''}{fmtINR(summary.totalPnl)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => onNavigateTab('Holdings')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#f97316' }]}>
            <TrendingUp size={22} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionPillText}>Holdings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => onNavigateTab('Savings')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#10b981' }]}>
            <Landmark size={22} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionPillText}>Savings &amp; FDs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => onNavigateTab('Allocation')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#8b5cf6' }]}>
            <PieChart size={22} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionPillText}>Allocation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => onNavigateTab('Expenses')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#f43f5e' }]}>
            <Receipt size={22} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionPillText}>Expenses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#3b82f6' }]}>
            <RefreshCw size={20} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionPillText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Asset Breakdown Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Portfolio Breakdown</Text>
        <TouchableOpacity onPress={() => onNavigateTab('Allocation')}>
          <Text style={styles.sectionLink}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Holdings Mini Card */}
      <TouchableOpacity
        style={styles.subCard}
        onPress={() => onNavigateTab('Holdings')}
        activeOpacity={0.7}
      >
        <View style={styles.subCardLeft}>
          <View style={[styles.subIconBg, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
            <BarChart2 size={20} color="#f97316" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.subCardTitle}>Equities &amp; Mutual Funds</Text>
            <Text style={styles.subCardSubtitle}>
              {holdings.length} {holdings.length === 1 ? 'Asset' : 'Assets'} tracked
            </Text>
          </View>
        </View>
        <View style={styles.subCardRight}>
          <Text style={styles.subCardAmount}>{fmtINR(summary.currentHoldings)}</Text>
          <Text style={[styles.subCardPnl, isPnlPositive ? styles.pnlPositive : styles.pnlNegative]}>
            {isPnlPositive ? '+' : ''}{fmtINR(summary.totalPnl)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Savings & Fixed Deposits Mini Card */}
      <TouchableOpacity
        style={styles.subCard}
        onPress={() => onNavigateTab('Savings')}
        activeOpacity={0.7}
      >
        <View style={styles.subCardLeft}>
          <View style={[styles.subIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Landmark size={20} color="#10b981" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.subCardTitle}>Savings &amp; Fixed Deposits</Text>
            <Text style={styles.subCardSubtitle}>
              {savings.length} {savings.length === 1 ? 'Account/FD' : 'Accounts & FDs'}
            </Text>
          </View>
        </View>
        <View style={styles.subCardRight}>
          <Text style={styles.subCardAmount}>{fmtINR(summary.totalSavings)}</Text>
          <Text style={styles.subCardSubtext}>
            Maturity: {fmtINR(summary.savingsAccountsTotal + summary.fdsMaturityTotal)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Monthly Cash Flow Mini Card */}
      <TouchableOpacity
        style={styles.subCard}
        onPress={() => onNavigateTab('Expenses')}
        activeOpacity={0.7}
      >
        <View style={styles.subCardLeft}>
          <View style={[styles.subIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
            <Receipt size={20} color="#f43f5e" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.subCardTitle}>Monthly Cash Flow</Text>
            <Text style={styles.subCardSubtitle}>
              Income {fmtINR(cashFlow.totalIncome)} · Exp {fmtINR(cashFlow.totalExpenses)}
            </Text>
          </View>
        </View>
        <View style={styles.subCardRight}>
          <Text style={[styles.subCardAmount, cashFlow.remaining >= 0 ? styles.pnlPositive : styles.pnlNegative]}>
            {cashFlow.remaining >= 0 ? '+' : ''}{fmtINR(cashFlow.remaining)}
          </Text>
          <Text style={styles.subCardSubtext}>
            {cashFlow.savingsRate.toFixed(0)}% Saved
          </Text>
        </View>
      </TouchableOpacity>

      {/* Recent Activity List */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No recent activities recorded yet.</Text>
        </View>
      ) : (
        activities.slice(0, 5).map((act, index) => (
          <View key={act.id || index} style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={styles.activityDot} />
              <View>
                <Text style={styles.activityTitle}>{act.title || act.type}</Text>
                <Text style={styles.activitySubtitle}>{act.details || act.time}</Text>
              </View>
            </View>
            <View style={styles.activityRight}>
              {act.amount ? (
                <Text style={styles.activityAmount}>{fmtINR(act.amount)}</Text>
              ) : null}
              <Text style={styles.activityStatus}>{act.status || 'Completed'}</Text>
            </View>
          </View>
        ))
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  welcomeText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500'
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#262b35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151'
  },
  avatarText: {
    color: '#f97316',
    fontWeight: '800',
    fontSize: 15
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14
  },
  netWorthCard: {
    backgroundColor: '#181b22',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#262b35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  badgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  badgeTextSuccess: {
    color: '#10b981'
  },
  badgeTextDanger: {
    color: '#ef4444'
  },
  netWorthAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 16
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#262b35',
    marginBottom: 14
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCol: {
    flex: 1
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff'
  },
  pnlPositive: {
    color: '#10b981'
  },
  pnlNegative: {
    color: '#ef4444'
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  actionPill: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  actionIconText: {
    fontSize: 20
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
    textAlign: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316'
  },
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181b22',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 10
  },
  subCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  subIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  subIconText: {
    fontSize: 18
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  },
  subCardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  subCardRight: {
    alignItems: 'flex-end'
  },
  subCardAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  subCardPnl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  subCardSubtext: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  emptyBox: {
    backgroundColor: '#181b22',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262b35'
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181b22',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262b35',
    marginBottom: 8
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
    marginRight: 10
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff'
  },
  activitySubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  activityRight: {
    alignItems: 'flex-end'
  },
  activityAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  activityStatus: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2
  }
})
