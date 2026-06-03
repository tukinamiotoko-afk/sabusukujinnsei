import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useExpenses, CAT, monthlyEq, cycleDisplay,
} from '../context/ExpensesContext';
import ServiceIcon, { ServiceIconMini, hasServiceIcon } from '../components/ServiceIcon';

const SCREEN_W = Dimensions.get('window').width;
const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;

type Mode = 'all' | 'subscription' | 'fixed';

// サービスごとに割り当てるカラーパレット
const PALETTE = [
  '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4',
  '#84CC16', '#E879F9', '#FB923C', '#34D399', '#818CF8',
  '#F43F5E', '#0EA5E9', '#A3E635', '#C084FC', '#FB7185',
];

// ── ドーナツチャート計算 ──────────────────────────────────────────────────────
const CHART_SIZE = Math.min(SCREEN_W - 96, 256);
const R_OUT = CHART_SIZE / 2 - 4;
const R_IN  = R_OUT * 0.60;
const CX    = CHART_SIZE / 2;
const CY    = CHART_SIZE / 2;

// 外周アイコン配置
const ICON_SZ  = 28;
const LABEL_R  = R_OUT + 10 + ICON_SZ / 2;
const DOC_PAD  = ICON_SZ + 14;
const WRAP_SZ  = CHART_SIZE + DOC_PAD * 2;
const WCX      = WRAP_SZ / 2;
const WCY      = WRAP_SZ / 2;

function iconPos(midDeg: number) {
  const rad = ((midDeg - 90) * Math.PI) / 180;
  return { left: WCX + LABEL_R * Math.cos(rad) - ICON_SZ / 2, top: WCY + LABEL_R * Math.sin(rad) - ICON_SZ / 2 };
}

function polarXY(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function segmentPath(startDeg: number, endDeg: number): string {
  const GAP = 1.2;
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

  // サービスごとのセグメント
  const segments = useMemo(() => {
    if (totalMonthly === 0) return [];
    let angle = 0;
    return filtered.map((item, i) => {
      const span  = (item.monthly / totalMonthly) * 360;
      const start = angle;
      angle += span;
      return {
        id:       item.expense.id,
        name:     item.expense.name,
        category: item.expense.category,
        monthly:  item.monthly,
        cycle:    item.expense.cycle,
        customCycleDays: item.expense.customCycleDays,
        color:    PALETTE[i % PALETTE.length],
        start,
        end:      angle,
        pct:      Math.round((item.monthly / totalMonthly) * 100),
        rank:     i + 1,
      };
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
          <View style={c.chartCard}>
            {/* ドーナツ */}
            <View style={[c.donutWrap, { width: WRAP_SZ, height: WRAP_SZ }]}>
              <Svg width={CHART_SIZE} height={CHART_SIZE}>
                {segments.length === 1 ? (
                  <>
                    <Circle cx={CX} cy={CY} r={R_OUT} fill={segments[0].color} />
                    <Circle cx={CX} cy={CY} r={R_IN}  fill="#F8FAFC" />
                  </>
                ) : (
                  segments.map(seg => (
                    <Path key={seg.id} d={segmentPath(seg.start, seg.end)} fill={seg.color} />
                  ))
                )}
              </Svg>
              {/* ドーナツ中央テキスト */}
              <View style={[c.donutCenter, { left: DOC_PAD, top: DOC_PAD, width: CHART_SIZE, height: CHART_SIZE }]}>
                <Text style={c.donutCenterLabel}>月額合計</Text>
                <Text style={c.donutCenterAmt}>{yen(totalMonthly)}</Text>
                <Text style={c.donutCenterCount}>{filtered.length}件</Text>
              </View>
              {/* 外周アイコン */}
              {segments.filter(seg => seg.end - seg.start >= 18).map(seg => {
                const mid = (seg.start + seg.end) / 2;
                const pos = iconPos(mid);
                const { color: catColor, icon: catIcon } = CAT[seg.category];
                return (
                  <View key={`oi-${seg.id}`} style={{ position: 'absolute', left: pos.left, top: pos.top }}>
                    {hasServiceIcon(seg.name)
                      ? <ServiceIconMini name={seg.name} size={ICON_SZ} />
                      : <View style={{ width: ICON_SZ, height: ICON_SZ, borderRadius: ICON_SZ * 0.28, backgroundColor: seg.color, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name={catIcon as never} size={12} color="#fff" />
                        </View>
                    }
                  </View>
                );
              })}
            </View>

            {/* サービス一覧（凡例） */}
            <View style={c.legendWrap}>
              {segments.map(seg => {
                const { color: catColor, icon: catIcon } = CAT[seg.category];
                return (
                  <View key={seg.id} style={c.legendRow}>
                    {/* カラーバー */}
                    <View style={[c.legendBar, { backgroundColor: seg.color }]} />

                    {/* ロゴ */}
                    {hasServiceIcon(seg.name)
                      ? <ServiceIcon name={seg.name} size={36} />
                      : <View style={[c.legendIcon, { backgroundColor: catColor + '20' }]}>
                          <Ionicons name={catIcon as never} size={16} color={catColor} />
                        </View>
                    }

                    {/* 名前・周期 */}
                    <View style={c.legendBody}>
                      <Text style={c.legendName} numberOfLines={1}>{seg.name}</Text>
                      <Text style={c.legendCycle}>
                        {cycleDisplay(seg.cycle, seg.customCycleDays)}
                      </Text>
                    </View>

                    {/* 金額・割合 */}
                    <View style={c.legendRight}>
                      <Text style={c.legendAmt}>{yen(seg.monthly)}</Text>
                      <Text style={c.legendPct}>{seg.pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
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

  donutWrap:        { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  donutCenter:      { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutCenterLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  donutCenterAmt:   { fontSize: 17, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
  donutCenterCount: { fontSize: 10, color: '#A0AEC0', marginTop: 1 },

  legendWrap:       { gap: 2 },
  legendRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  legendBar:        { width: 4, height: 36, borderRadius: 2 },
  legendIcon:       { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  legendBody:       { flex: 1, gap: 2 },
  legendName:       { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  legendCycle:      { fontSize: 10, color: '#A0AEC0' },
  legendRight:      { alignItems: 'flex-end', gap: 2 },
  legendAmt:        { fontSize: 14, fontWeight: '800', color: '#1A202C' },
  legendPct:        { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
});
