import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, getDay, getDaysInMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useExpenses,
  CAT,
  isPaymentOnDate,
  cycleDisplay,
  type Expense,
} from '../context/ExpensesContext';

const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;

const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

// ─── カレンダーグリッド計算 ───────────────────────────────────────────────────

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDow = getDay(startOfMonth(new Date(year, month, 1))); // 0=Sun
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getExpensesForDay(expenses: Expense[], year: number, month: number, day: number): Expense[] {
  const date = new Date(year, month, day);
  return expenses.filter(e => isPaymentOnDate(e, date));
}

// ─── DayCell ─────────────────────────────────────────────────────────────────

function DayCell({
  day,
  expenses,
  year,
  month,
  isToday,
  isSelected,
  onPress,
}: {
  day: number | null;
  expenses: Expense[];
  year: number;
  month: number;
  isToday: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  if (day === null) return <View style={c.dayCell} />;

  const hits = day !== null ? getExpensesForDay(expenses, year, month, day) : [];
  const dots = hits.slice(0, 3);

  return (
    <TouchableOpacity
      style={[c.dayCell, isSelected && c.dayCellSelected, isToday && !isSelected && c.dayCellToday]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[c.dayNum, isSelected && c.dayNumSelected, isToday && !isSelected && c.dayNumToday]}>
        {day}
      </Text>
      <View style={c.dotsRow}>
        {dots.map((e, i) => (
          <View key={i} style={[c.dot, { backgroundColor: CAT[e.category].color }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ─── CalendarScreen ───────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { expenses } = useExpenses();

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const cells = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedExpenses = useMemo(() => {
    if (selectedDay === null) return [];
    return getExpensesForDay(expenses, viewYear, viewMonth, selectedDay);
  }, [expenses, viewYear, viewMonth, selectedDay]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const monthTotal = useMemo(() => {
    let total = 0;
    const daysInMonth = getDaysInMonth(new Date(viewYear, viewMonth, 1));
    for (let d = 1; d <= daysInMonth; d++) {
      const hits = getExpensesForDay(expenses, viewYear, viewMonth, d);
      total += hits.reduce((s, e) => s + e.amount, 0);
    }
    return total;
  }, [expenses, viewYear, viewMonth]);

  return (
    <View style={c.root}>
      {/* ── ヘッダ ── */}
      <View style={[c.header, { paddingTop: insets.top + 12 }]}>
        <Text style={c.screenTitle}>カレンダー</Text>

        {/* 月ナビゲーション */}
        <View style={c.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={c.navBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color="#6C63FF" />
          </TouchableOpacity>
          <Text style={c.monthLabel}>
            {format(new Date(viewYear, viewMonth, 1), 'yyyy年M月', { locale: ja })}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={c.navBtn} hitSlop={8}>
            <Ionicons name="chevron-forward" size={22} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <Text style={c.monthTotal}>この月の支払い合計: {yen(monthTotal)}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 曜日ヘッダ ── */}
        <View style={c.weekRow}>
          {WEEK_LABELS.map((w, i) => (
            <Text key={w} style={[c.weekLabel, i === 0 && c.sun, i === 6 && c.sat]}>
              {w}
            </Text>
          ))}
        </View>

        {/* ── カレンダーグリッド ── */}
        <View style={c.grid}>
          {cells.map((day, idx) => {
            const dow = idx % 7;
            const isToday =
              day !== null &&
              viewYear === today.getFullYear() &&
              viewMonth === today.getMonth() &&
              day === today.getDate();
            return (
              <DayCell
                key={idx}
                day={day}
                expenses={expenses}
                year={viewYear}
                month={viewMonth}
                isToday={isToday}
                isSelected={day !== null && day === selectedDay}
                onPress={() => day !== null && setSelectedDay(day)}
              />
            );
          })}
        </View>

        {/* ── 選択日の支払い一覧 ── */}
        {selectedDay !== null && (
          <View style={c.detailSection}>
            <Text style={c.detailTitle}>
              {format(new Date(viewYear, viewMonth, selectedDay), 'M月d日(E)', { locale: ja })}
              {'  '}
              {selectedExpenses.length === 0 ? '支払いなし' : `${selectedExpenses.length}件`}
            </Text>

            {selectedExpenses.length === 0 ? (
              <View style={c.noPayment}>
                <Ionicons name="checkmark-circle-outline" size={36} color="#CBD5E0" />
                <Text style={c.noPaymentText}>この日の支払いはありません</Text>
              </View>
            ) : (
              selectedExpenses.map(exp => {
                const { label, color, icon } = CAT[exp.category];
                return (
                  <View key={exp.id} style={c.detailCard}>
                    <View style={[c.detailIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon as never} size={20} color={color} />
                    </View>
                    <View style={c.detailBody}>
                      <Text style={c.detailName} numberOfLines={1}>{exp.name}</Text>
                      <View style={c.detailMeta}>
                        <View style={[c.catChip, { backgroundColor: color + '18' }]}>
                          <Text style={[c.catChipText, { color }]}>{label}</Text>
                        </View>
                        <Text style={c.detailCycle}>{cycleDisplay(exp.cycle, exp.customCycleDays)}</Text>
                      </View>
                    </View>
                    <Text style={c.detailAmount}>{yen(exp.amount)}</Text>
                  </View>
                );
              })
            )}

            {selectedExpenses.length > 0 && (
              <View style={c.detailTotal}>
                <Text style={c.detailTotalLabel}>合計</Text>
                <Text style={c.detailTotalValue}>
                  {yen(selectedExpenses.reduce((s, e) => s + e.amount, 0))}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── スタイル ─────────────────────────────────────────────────────────────────

const c = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#F5F6FA' },
  header:            { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  screenTitle:       { fontSize: 22, fontWeight: '800', color: '#1A202C', marginBottom: 12 },
  monthNav:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  navBtn:            { padding: 4 },
  monthLabel:        { fontSize: 18, fontWeight: '700', color: '#1A202C' },
  monthTotal:        { fontSize: 12, color: '#718096', marginTop: 4 },
  weekRow:           { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  weekLabel:         { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#718096' },
  sun:               { color: '#FC5A5A' },
  sat:               { color: '#4299E1' },
  grid:              { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4, paddingVertical: 4, backgroundColor: '#fff' },
  dayCell:           { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 6, gap: 2 },
  dayCellToday:      { backgroundColor: '#EEF2FF', borderRadius: 10 },
  dayCellSelected:   { backgroundColor: '#6C63FF', borderRadius: 10 },
  dayNum:            { fontSize: 14, fontWeight: '600', color: '#1A202C' },
  dayNumToday:       { color: '#6C63FF', fontWeight: '800' },
  dayNumSelected:    { color: '#fff', fontWeight: '800' },
  dotsRow:           { flexDirection: 'row', gap: 2 },
  dot:               { width: 5, height: 5, borderRadius: 3 },
  detailSection:     { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  detailTitle:       { fontSize: 15, fontWeight: '700', color: '#1A202C', marginBottom: 12 },
  noPayment:         { alignItems: 'center', paddingVertical: 20, gap: 8 },
  noPaymentText:     { fontSize: 14, color: '#CBD5E0' },
  detailCard:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', gap: 10 },
  detailIcon:        { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  detailBody:        { flex: 1, gap: 4 },
  detailName:        { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  detailMeta:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catChip:           { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  catChipText:       { fontSize: 11, fontWeight: '700' },
  detailCycle:       { fontSize: 11, color: '#A0AEC0' },
  detailAmount:      { fontSize: 16, fontWeight: '800', color: '#1A202C' },
  detailTotal:       { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  detailTotalLabel:  { fontSize: 14, fontWeight: '700', color: '#718096' },
  detailTotalValue:  { fontSize: 16, fontWeight: '800', color: '#6C63FF' },
});
