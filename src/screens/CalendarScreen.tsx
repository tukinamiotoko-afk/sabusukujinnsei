import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Animated,
  PanResponder,
  Dimensions,
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
import ServiceIcon, { ServiceIconMini, hasServiceIcon } from '../components/ServiceIcon';
import { getCancelUrl } from '../data/templates';

const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;
const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50;

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
  const shown = hits.slice(0, 3);

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
        {shown.map((e, i) =>
          hasServiceIcon(e.name)
            ? <ServiceIconMini key={i} name={e.name} size={14} />
            : <View key={i} style={[c.dot, { backgroundColor: CAT[e.category].color }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── CalendarScreen ───────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, setExpenses } = useExpenses();

  const deleteExpense = (id: string, name: string) => {
    Alert.alert('削除の確認', `「${name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => setExpenses(prev => prev.filter(e => e.id !== id)) },
    ]);
  };

  const openCancelPage = (name: string) => {
    const url = getCancelUrl(name)
      ?? `https://www.google.com/search?q=${encodeURIComponent(name + ' 退会方法')}`;
    Linking.openURL(url);
  };

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

  const translateX = useRef(new Animated.Value(0)).current;

  const animateMonth = (direction: 'prev' | 'next') => {
    const outX = direction === 'prev' ? SCREEN_W : -SCREEN_W;
    const inX  = direction === 'prev' ? -SCREEN_W : SCREEN_W;
    Animated.timing(translateX, { toValue: outX, duration: 180, useNativeDriver: true }).start(() => {
      if (direction === 'prev') prevMonth(); else nextMonth();
      translateX.setValue(inX);
      Animated.timing(translateX, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    });
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      translateX.setValue(g.dx * 0.25);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD || g.vx > 0.5)       animateMonth('prev');
      else if (g.dx < -SWIPE_THRESHOLD || g.vx < -0.5) animateMonth('next');
      else Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    },
  })).current;

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
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>
          <Text style={c.monthLabel}>
            {format(new Date(viewYear, viewMonth, 1), 'yyyy年M月', { locale: ja })}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={c.navBtn} hitSlop={8}>
            <Ionicons name="chevron-forward" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        <Text style={c.monthTotal}>この月の支払い合計: {yen(monthTotal)}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 曜日ヘッダ＋グリッド（スワイプで月移動） ── */}
        <View style={c.calendarWrap}>
          <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
            <View style={c.weekRow}>
              {WEEK_LABELS.map((w, i) => (
                <Text key={w} style={[c.weekLabel, i === 0 && c.sun, i === 6 && c.sat]}>
                  {w}
                </Text>
              ))}
            </View>
            <View style={c.grid}>
              {cells.map((day, idx) => {
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
          </Animated.View>
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
                    {hasServiceIcon(exp.name)
                      ? <ServiceIcon name={exp.name} size={40} />
                      : <View style={[c.detailIcon, { backgroundColor: color + '20' }]}>
                          <Ionicons name={icon as never} size={20} color={color} />
                        </View>
                    }
                    <View style={c.detailBody}>
                      <Text style={c.detailName} numberOfLines={1}>{exp.name}</Text>
                      <View style={c.detailMeta}>
                        <View style={[c.catChip, { backgroundColor: color + '18' }]}>
                          <Text style={[c.catChipText, { color }]}>{label}</Text>
                        </View>
                        <Text style={c.detailCycle}>{cycleDisplay(exp.cycle, exp.customCycleDays)}</Text>
                      </View>
                    </View>
                    <View style={c.detailRight}>
                      <Text style={c.detailAmount}>{yen(exp.amount)}</Text>
                      <View style={c.cardActions}>
                        <TouchableOpacity
                          style={c.actionBtn}
                          onPress={() => openCancelPage(exp.name)}
                          hitSlop={6}
                        >
                          <Ionicons name="log-out-outline" size={18} color="#718096" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={c.actionBtn}
                          onPress={() => deleteExpense(exp.id, exp.name)}
                          hitSlop={6}
                        >
                          <Ionicons name="trash-outline" size={18} color="#FC5A5A" />
                        </TouchableOpacity>
                      </View>
                    </View>
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
  calendarWrap:      { overflow: 'hidden', backgroundColor: '#fff' },
  weekRow:           { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  weekLabel:         { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#718096' },
  sun:               { color: '#FC5A5A' },
  sat:               { color: '#4299E1' },
  grid:              { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4, paddingVertical: 4, backgroundColor: '#fff' },
  dayCell:           { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4, gap: 3 },
  dayCellToday:      { backgroundColor: '#F3F4F6', borderRadius: 10 },
  dayCellSelected:   { backgroundColor: '#374151', borderRadius: 10 },
  dayNum:            { fontSize: 22, fontWeight: '700', color: '#1A202C' },
  dayNumToday:       { color: '#374151', fontWeight: '800' },
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
  detailRight:       { alignItems: 'flex-end', gap: 6 },
  detailAmount:      { fontSize: 16, fontWeight: '800', color: '#1A202C' },
  cardActions:       { flexDirection: 'row', gap: 4 },
  actionBtn:         { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center' },
  detailTotal:       { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  detailTotalLabel:  { fontSize: 14, fontWeight: '700', color: '#718096' },
  detailTotalValue:  { fontSize: 16, fontWeight: '800', color: '#374151' },
});
