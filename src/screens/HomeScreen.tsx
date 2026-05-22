import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Expense, RootStackParamList, Category } from '../types';
import { loadExpenses } from '../utils/storage';
import {
  getThisMonthTotal,
  getAnnualTotal,
  getNextPayment,
  getCategoryMonthlyTotals,
  formatCurrency,
  formatDate,
  getDaysUntil,
  formatMonthYear,
} from '../utils/calculations';
import {
  COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORIES,
  CYCLE_LABELS,
} from '../constants';
import { ExpenseCard } from '../components/ExpenseCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await loadExpenses();
    setExpenses(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const thisMonthTotal = getThisMonthTotal(expenses);
  const annualTotal = getAnnualTotal(expenses);
  const nextPayment = getNextPayment(expenses);
  const categoryTotals = getCategoryMonthlyTotals(expenses);
  const monthlyTotal = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );

  const activeCategoryEntries = CATEGORIES
    .map(cat => ({ cat, amount: categoryTotals[cat] ?? 0 }))
    .filter(({ amount }) => amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#7C73FF', '#6C63FF', '#5A52E8']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>固定費管理</Text>
          <Text style={styles.headerSub}>{formatMonthYear()}</Text>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>今月の予定出費</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(thisMonthTotal)}</Text>
              <Text style={styles.summaryNote}>
                {expenses.filter(e => {
                  const d = new Date(e.nextDate);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}件
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>年間見込み</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(Math.round(annualTotal))}</Text>
              <Text style={styles.summaryNote}>月平均 {formatCurrency(Math.round(annualTotal / 12))}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Next Payment */}
          {nextPayment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>次の支払い</Text>
              <TouchableOpacity
                style={styles.nextCard}
                onPress={() => navigation.navigate('Detail', { expense: nextPayment })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6584', '#FF4D6A']}
                  style={styles.nextCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.nextCardContent}>
                    <View>
                      <Text style={styles.nextCardLabel}>次回支払い</Text>
                      <Text style={styles.nextCardName}>{nextPayment.name}</Text>
                      <Text style={styles.nextCardDate}>{formatDate(nextPayment.nextDate)}</Text>
                    </View>
                    <View style={styles.nextCardRight}>
                      <Text style={styles.nextCardAmount}>{formatCurrency(nextPayment.amount)}</Text>
                      {(() => {
                        const d = getDaysUntil(nextPayment.nextDate);
                        return (
                          <View style={styles.nextCardBadge}>
                            <Text style={styles.nextCardBadgeText}>
                              {d < 0 ? `${Math.abs(d)}日超過` : d === 0 ? '今日' : `あと${d}日`}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Category Summary */}
          {activeCategoryEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>カテゴリ別 月額換算</Text>
              <View style={styles.categoryCard}>
                {activeCategoryEntries.map(({ cat, amount }) => {
                  const color = CATEGORY_COLORS[cat as Category];
                  const pct = monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0;
                  return (
                    <View key={cat} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryDot, { backgroundColor: color }]} />
                        <View style={[styles.catIconWrap, { backgroundColor: color + '18' }]}>
                          <Ionicons name={CATEGORY_ICONS[cat as Category] as never} size={14} color={color} />
                        </View>
                        <Text style={styles.categoryName}>{CATEGORY_LABELS[cat as Category]}</Text>
                      </View>
                      <View style={styles.categoryBarWrap}>
                        <View style={[styles.categoryBar, { width: `${pct}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.categoryAmount}>{formatCurrency(Math.round(amount))}</Text>
                    </View>
                  );
                })}
                <View style={styles.categoryTotal}>
                  <Text style={styles.categoryTotalLabel}>月額合計</Text>
                  <Text style={styles.categoryTotalAmount}>{formatCurrency(Math.round(monthlyTotal))}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Expense List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>登録一覧</Text>
              <Text style={styles.sectionCount}>{expenses.length}件</Text>
            </View>
            {sortedExpenses.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>まだ登録がありません</Text>
                <Text style={styles.emptySubText}>右下の＋ボタンから追加できます</Text>
              </View>
            ) : (
              sortedExpenses.map(e => (
                <ExpenseCard
                  key={e.id}
                  expense={e}
                  onPress={() => navigation.navigate('Detail', { expense: e })}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEdit', {})}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#7C73FF', '#6C63FF']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  summaryNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  body: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 10,
  },
  nextCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6584',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextCardGradient: {
    padding: 20,
  },
  nextCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextCardLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginBottom: 4,
  },
  nextCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  nextCardDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  nextCardRight: {
    alignItems: 'flex-end',
  },
  nextCardAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  nextCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  nextCardBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  categoryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  catIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  categoryBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
  },
  categoryAmount: {
    width: 72,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  categoryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
  },
  categoryTotalLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  categoryTotalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.border,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
