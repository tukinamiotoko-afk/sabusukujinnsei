import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses, CAT, monthlyEq, cycleDisplay } from '../context/ExpensesContext';
import ServiceIcon, { hasServiceIcon } from '../components/ServiceIcon';

const SCREEN_W = Dimensions.get('window').width;
const BAR_MAX_W = SCREEN_W - 140;
const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;

export default function ChartScreen() {
  const insets = useSafeAreaInsets();
  const { expenses } = useExpenses();

  const sorted = useMemo(() => {
    return [...expenses]
      .map(e => ({ expense: e, monthly: monthlyEq(e.amount, e.cycle, e.customCycleDays) }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [expenses]);

  const maxMonthly = sorted.length > 0 ? sorted[0].monthly : 1;
  const totalMonthly = sorted.reduce((s, x) => s + x.monthly, 0);

  return (
    <View style={c.root}>
      <View style={[c.header, { paddingTop: insets.top + 12 }]}>
        <Text style={c.screenTitle}>グラフ</Text>
        <Text style={c.totalTxt}>月額合計 {yen(totalMonthly)}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={c.empty}>
            <Ionicons name="bar-chart-outline" size={52} color="#CBD5E0" />
            <Text style={c.emptyTxt}>登録がありません</Text>
          </View>
        ) : (
          <>
            {/* ── 横棒グラフ ── */}
            <View style={c.chartSection}>
              <Text style={c.sectionLabel}>月額 高い順</Text>
              {sorted.map(({ expense: e, monthly }) => {
                const { color } = CAT[e.category];
                const barW = maxMonthly > 0 ? (monthly / maxMonthly) * BAR_MAX_W : 0;
                return (
                  <View key={e.id} style={c.barRow}>
                    <Text style={c.barName} numberOfLines={1}>{e.name}</Text>
                    <View style={c.barTrack}>
                      <View style={[c.bar, { width: barW, backgroundColor: color }]} />
                    </View>
                    <Text style={c.barAmt}>{yen(monthly)}</Text>
                  </View>
                );
              })}
            </View>

            {/* ── カード一覧 ── */}
            <View style={c.cardSection}>
              <Text style={c.sectionLabel}>詳細</Text>
              {sorted.map(({ expense: e, monthly }, i) => {
                const { label, color, icon } = CAT[e.category];
                const pct = totalMonthly > 0 ? Math.round((monthly / totalMonthly) * 100) : 0;
                return (
                  <View key={e.id} style={c.card}>
                    <Text style={c.rank}>#{i + 1}</Text>
                    {hasServiceIcon(e.name)
                      ? <ServiceIcon name={e.name} size={40} />
                      : <View style={[c.iconBox, { backgroundColor: color + '20' }]}>
                          <Ionicons name={icon as never} size={20} color={color} />
                        </View>
                    }
                    <View style={c.cardBody}>
                      <Text style={c.cardName} numberOfLines={1}>{e.name}</Text>
                      <View style={c.cardMeta}>
                        <View style={[c.chip, { backgroundColor: color + '18' }]}>
                          <Text style={[c.chipTxt, { color }]}>{label}</Text>
                        </View>
                        <Text style={c.cycleTxt}>{cycleDisplay(e.cycle, e.customCycleDays)}</Text>
                      </View>
                      <View style={c.barMini}>
                        <View style={[c.barMiniFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                      </View>
                    </View>
                    <View style={c.cardRight}>
                      <Text style={c.cardAmt}>{yen(monthly)}</Text>
                      <Text style={c.cardPct}>{pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const c = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F8FAFC' },
  header:        { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  screenTitle:   { fontSize: 22, fontWeight: '800', color: '#1A202C', marginBottom: 2 },
  totalTxt:      { fontSize: 13, color: '#718096' },
  empty:         { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTxt:      { fontSize: 15, color: '#CBD5E0' },
  chartSection:  { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionLabel:  { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  barRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barName:       { width: 72, fontSize: 11, color: '#475569', fontWeight: '600', textAlign: 'right' },
  barTrack:      { flex: 1, height: 14, backgroundColor: '#F1F5F9', borderRadius: 7, overflow: 'hidden' },
  bar:           { height: 14, borderRadius: 7 },
  barAmt:        { width: 60, fontSize: 11, color: '#1A202C', fontWeight: '700', textAlign: 'right' },
  cardSection:   { marginHorizontal: 16, marginBottom: 8 },
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, gap: 10 },
  rank:          { width: 24, fontSize: 12, fontWeight: '700', color: '#94A3B8', textAlign: 'center' },
  iconBox:       { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardBody:      { flex: 1, gap: 3 },
  cardName:      { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  cardMeta:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip:          { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  chipTxt:       { fontSize: 10, fontWeight: '700' },
  cycleTxt:      { fontSize: 10, color: '#A0AEC0' },
  barMini:       { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  barMiniFill:   { height: 4, borderRadius: 2 },
  cardRight:     { alignItems: 'flex-end', gap: 2 },
  cardAmt:       { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  cardPct:       { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});
