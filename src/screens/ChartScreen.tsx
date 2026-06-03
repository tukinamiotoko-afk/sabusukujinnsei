import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useExpenses, CAT, CATEGORIES, monthlyEq, cycleDisplay,
} from '../context/ExpensesContext';
import ServiceIcon, { hasServiceIcon } from '../components/ServiceIcon';

const SCREEN_W = Dimensions.get('window').width;
const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;

type Mode = 'all' | 'subscription' | 'fixed';

// ── ドーナツチャート計算 ────────────────────────────────────────────────────
const CHART_SIZE = Math.min(SCREEN_W - 96, 256);
const R_OUT = CHART_SIZE / 2 - 4;
const R_IN  = R_OUT * 0.60;
const CX    = CHART_SIZE / 2;
const CY    = CHART_SIZE / 2;

function polarXY(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function segmentPath(startDeg: number, endDeg: number): string {
  const GAP = 1.5;
  const s = startDeg + GAP / 2;
  const e = endDeg   - GAP / 2;
  if (e - s < 0.5) return '';
  const large = (e - s > 180) ? 1 : 0;
  const o1 = polarXY(R_OUT, s); const o2 = polarXY(R_OUT, e);
  const i1 = polarXY(R_IN,  s); const i2 = polarXY(R_IN,  e);
  return [
    `M${o1.x} ${o1.y}`,
    `A${R_OUT} ${R_OUT} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L${i2.x} ${i2.y}`,
    `A${R_IN} ${R_IN} 0 ${large} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ');
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'all',          label: '全体' },
  { value: 'subscription', label: 'サブスク' },
  { value: 'fixed',        label: '固定費' },
];

export default function ChartScreen() {
  const insets = useSafeAreaInsets();
  const { expenses } = useExpenses();
  const [mode, setMode] = useState<Mode>('all');

  const filtered = useMemo(() => {
    return expenses
      .map(e => ({ expense: e, monthly: monthlyEq(e.amount, e.cycle, e.customCycleDays) }))
      .filter(({ expense: e }) => {
        if (mode === 'subscription') return e.category === 'subscription';
        if (mode === 'fixed')        return e.category !== 'subscription';
        return true;
      })
      .sort((a, b) => b.monthly - a.monthly);
  }, [expenses, mode]);

  const totalMonthly = filtered.reduce((s, x) => s + x.monthly, 0);

  const catSegments = useMemo(() => {
    if (totalMonthly === 0) return [];
    const cats = CATEGORIES
      .map(cat => ({
        cat,
        total: filtered
          .filter(x => x.expense.category === cat)
          .reduce((s, x) => s + x.monthly, 0),
        color: CAT[cat].color,
        label: CAT[cat].label,
      }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total);

    let angle = 0;
    return cats.map(d => {
      const span  = (d.total / totalMonthly) * 360;
      const start = angle;
      angle += span;
      return { ...d, start, end: angle, pct: Math.round((d.total / totalMonthly) * 100) };
    });
  }, [filtered, totalMonthly]);

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
        {/* モード切り替え */}
        <View style={c.modeBar}>
          {MODES.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[c.modeBtn, mode === m.value && c.modeBtnActive]}
              onPress={() => setMode(m.value)}
              activeOpacity={0.7}
            >
              <Text style={[c.modeBtnTxt, mode === m.value && c.modeBtnTxtActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={c.empty}>
            <Ionicons name="pie-chart-outline" size={52} color="#CBD5E0" />
            <Text style={c.emptyTxt}>登録がありません</Text>
          </View>
        ) : (
          <>
            {/* ── 円グラフ ── */}
            <View style={c.chartCard}>
              <Text style={c.sectionLabel}>カテゴリ別</Text>

              <View style={c.donutWrap}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                  {catSegments.length === 1 ? (
                    <>
                      <Circle cx={CX} cy={CY} r={R_OUT} fill={catSegments[0].color} />
                      <Circle cx={CX} cy={CY} r={R_IN}  fill="#F8FAFC" />
                    </>
                  ) : (
                    catSegments.map((seg, i) => (
                      <Path key={i} d={segmentPath(seg.start, seg.end)} fill={seg.color} />
                    ))
                  )}
                </Svg>
                {/* 中央テキスト */}
                <View style={c.donutCenter}>
                  <Text style={c.donutCenterLabel}>月額合計</Text>
                  <Text style={c.donutCenterAmt}>{yen(totalMonthly)}</Text>
                  <Text style={c.donutCenterCount}>{filtered.length}件</Text>
                </View>
              </View>

              {/* カテゴリ凡例 */}
              <View style={c.legendWrap}>
                {catSegments.map(seg => (
                  <View key={seg.cat} style={c.legendRow}>
                    <View style={[c.legendDot, { backgroundColor: seg.color }]} />
                    <Text style={c.legendLabel}>{seg.label}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={c.legendPct}>{seg.pct}%</Text>
                    <Text style={c.legendAmt}>{yen(seg.total)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── サービスカード一覧 ── */}
            <View style={c.cardSection}>
              <Text style={c.sectionLabel}>詳細 高い順</Text>
              {filtered.map(({ expense: e, monthly }, i) => {
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
  root:             { flex: 1, backgroundColor: '#F8FAFC' },
  header:           { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  screenTitle:      { fontSize: 22, fontWeight: '800', color: '#1A202C', marginBottom: 2 },
  totalTxt:         { fontSize: 13, color: '#718096' },

  modeBar:          { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8, gap: 8 },
  modeBtn:          { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modeBtnActive:    { backgroundColor: '#475569' },
  modeBtnTxt:       { fontSize: 13, fontWeight: '600', color: '#64748B' },
  modeBtnTxtActive: { color: '#fff' },

  empty:            { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTxt:         { fontSize: 15, color: '#CBD5E0' },

  chartCard:        { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionLabel:     { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  donutWrap:        { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  donutCenter:      { position: 'absolute', alignItems: 'center' },
  donutCenterLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  donutCenterAmt:   { fontSize: 17, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
  donutCenterCount: { fontSize: 10, color: '#A0AEC0', marginTop: 1 },

  legendWrap:       { gap: 10 },
  legendRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:        { width: 10, height: 10, borderRadius: 5 },
  legendLabel:      { fontSize: 13, fontWeight: '600', color: '#475569' },
  legendPct:        { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginRight: 4 },
  legendAmt:        { fontSize: 13, fontWeight: '700', color: '#1A202C', minWidth: 80, textAlign: 'right' },

  cardSection:      { marginHorizontal: 16, marginBottom: 8 },
  card:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, gap: 10 },
  rank:             { width: 24, fontSize: 12, fontWeight: '700', color: '#94A3B8', textAlign: 'center' },
  iconBox:          { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardBody:         { flex: 1, gap: 3 },
  cardName:         { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  cardMeta:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip:             { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  chipTxt:          { fontSize: 10, fontWeight: '700' },
  cycleTxt:         { fontSize: 10, color: '#A0AEC0' },
  barMini:          { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  barMiniFill:      { height: 4, borderRadius: 2 },
  cardRight:        { alignItems: 'flex-end', gap: 2 },
  cardAmt:          { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  cardPct:          { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});
