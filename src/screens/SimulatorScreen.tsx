import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Linking,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useExpenses,
  CAT,
  monthlyEq,
  type Expense,
} from '../context/ExpensesContext';
import ServiceIcon, { hasServiceIcon } from '../components/ServiceIcon';
import { getCancelUrl } from '../data/templates';

const SCREEN_W = Dimensions.get('window').width;
const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;

export default function SimulatorScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, setExpenses } = useExpenses();

  const [checkedIds,    setCheckedIds]    = useState<Set<string>>(new Set());
  const [cancelDoneIds, setCancelDoneIds] = useState<Set<string>>(new Set());
  const slideAnim = useRef(new Animated.Value(SCREEN_W)).current;
  const [cancelMode, setCancelMode] = useState(false);

  const sortedExpenses = useMemo(() => {
    return expenses
      .map(e => ({ expense: e, monthly: monthlyEq(e.amount, e.cycle, e.customCycleDays) }))
      .sort((a, b) => {
        if (a.monthly === 0 && b.monthly === 0) return 0;
        if (a.monthly === 0) return 1;
        if (b.monthly === 0) return -1;
        return b.monthly - a.monthly;
      });
  }, [expenses]);

  const checkedExpenses = useMemo(
    () => sortedExpenses.filter(({ expense }) => checkedIds.has(expense.id)),
    [sortedExpenses, checkedIds]
  );

  const totalMonthly = useMemo(
    () => sortedExpenses.reduce((sum, { monthly }) => sum + monthly, 0),
    [sortedExpenses]
  );

  const totalReduction = useMemo(
    () => checkedExpenses.reduce((sum, { monthly }) => sum + monthly, 0),
    [checkedExpenses]
  );

  // 月額合計のアニメーション
  const animTotal = useRef(new Animated.Value(0)).current;
  const [dispTotal, setDispTotal] = useState(0);

  useEffect(() => {
    const id = animTotal.addListener(({ value }) => setDispTotal(Math.round(value)));
    return () => animTotal.removeListener(id);
  }, []);

  useEffect(() => {
    Animated.timing(animTotal, {
      toValue: totalMonthly - totalReduction,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [totalMonthly, totalReduction]);

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleCancelDone = (id: string) => {
    setCancelDoneIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Android 戻るボタン: 退会フローを閉じる
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (cancelMode) { closeCancelFlow(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [cancelMode]);

  const openCancelFlow = () => {
    setCancelMode(true);
    setCancelDoneIds(new Set());
    Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closeCancelFlow = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_W, duration: 220, useNativeDriver: true })
      .start(() => setCancelMode(false));
  };

  const handleBulkDelete = () => {
    const count = cancelDoneIds.size;
    if (count === 0) {
      Alert.alert('退会済みなし', '退会したサービスにチェックを入れてください');
      return;
    }
    Alert.alert(
      '一括削除の確認',
      `退会済みの${count}件を一覧から削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            setExpenses(prev => prev.filter(e => !cancelDoneIds.has(e.id)));
            setCheckedIds(prev => { const n = new Set(prev); cancelDoneIds.forEach(id => n.delete(id)); return n; });
            setCancelDoneIds(new Set());
            closeCancelFlow();
          },
        },
      ]
    );
  };

  const handleQuickDelete = () => {
    Alert.alert(
      '削除の確認',
      `チェックした${checkedIds.size}件を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => { setExpenses(prev => prev.filter(e => !checkedIds.has(e.id))); setCheckedIds(new Set()); },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <Text style={s.headerTitle}>一括削除</Text>
      </View>

      {/* ── メイン一覧 ── */}
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, {
          paddingTop: 16,
          paddingBottom: insets.bottom + (checkedIds.size > 0 ? 110 : 24),
        }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 合計カード ── */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>月額合計</Text>
            <View style={s.summaryAmountRow}>
              <Text style={[s.summaryAmount, checkedIds.size > 0 && s.summaryAmountReducing]}>
                {yen(dispTotal)}
              </Text>
              <Text style={s.summarySub}>/月</Text>
            </View>
          </View>
          {checkedIds.size > 0 && (
            <View style={s.reductionRow}>
              <View style={s.reductionDivider} />
              <View style={s.summaryRow}>
                <Text style={s.reductionLabel}>削減合計 ({checkedIds.size}件)</Text>
                <View style={s.summaryAmountRow}>
                  <Text style={s.reductionAmount}>-{yen(Math.round(totalReduction))}</Text>
                  <Text style={s.summarySub}>/月</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={s.listSection}>
          <View style={s.listHeader}>
            <Text style={s.listTitle}>固定費一覧</Text>
            <Text style={s.listCount}>{expenses.length}件</Text>
          </View>

          {sortedExpenses.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={52} color="#CBD5E0" />
              <Text style={s.emptyTitle}>登録がありません</Text>
              <Text style={s.emptySub}>一覧タブから固定費を追加してください</Text>
            </View>
          ) : (
            sortedExpenses.map(({ expense, monthly }) => {
              const checked = checkedIds.has(expense.id);
              const { color, icon } = CAT[expense.category];
              return (
                <TouchableOpacity
                  key={expense.id}
                  style={[s.row, checked && s.rowChecked]}
                  onPress={() => toggleCheck(expense.id)}
                  activeOpacity={0.75}
                >
                  <View style={[s.checkbox, checked && s.checkboxChecked]}>
                    {checked && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  {hasServiceIcon(expense.name) ? (
                    <ServiceIcon name={expense.name} size={40} />
                  ) : (
                    <View style={[s.catIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon as never} size={20} color={color} />
                    </View>
                  )}
                  <View style={s.rowBody}>
                    <Text style={s.rowName} numberOfLines={1}>{expense.name}</Text>
                  </View>
                  <View style={s.rowRight}>
                    <Text style={[s.rowAmount, checked && s.textRed]}>
                      {monthly === 0 ? '不定期' : yen(Math.round(monthly))}
                    </Text>
                    {monthly !== 0 && <Text style={s.rowAmountSub}>/月</Text>}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── ボトムバー ── */}
      {checkedIds.size > 0 && (
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={s.cancelFlowBtn} onPress={openCancelFlow} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={s.cancelFlowBtnText}>{checkedIds.size}件を退会する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickDeleteBtn} onPress={handleQuickDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color="#FC5A5A" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── 退会フロー画面（スライドイン） ── */}
      {cancelMode && (
        <Animated.View style={[s.flowPanel, { transform: [{ translateX: slideAnim }] }]}>
          {/* ヘッダー */}
          <View style={[s.flowHeader, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity style={s.flowBack} onPress={closeCancelFlow} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#1A202C" />
            </TouchableOpacity>
            <Text style={s.flowTitle}>退会手続き</Text>
            <View style={{ width: 44 }} />
          </View>
          <Text style={s.flowHint}>退会ページを開いて手続き後、チェックを入れてください</Text>

          <ScrollView
            contentContainerStyle={[s.flowContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {checkedExpenses.map(({ expense, monthly }) => {
              const done = cancelDoneIds.has(expense.id);
              const { color, icon } = CAT[expense.category];
              const cancelUrl = getCancelUrl(expense.name)
                ?? `https://www.google.com/search?q=${encodeURIComponent(expense.name + ' 退会方法')}`;
              return (
                <View key={expense.id} style={[s.flowRow, done && s.flowRowDone]}>
                  <View style={s.flowRowLeft}>
                    {hasServiceIcon(expense.name) ? (
                      <ServiceIcon name={expense.name} size={42} />
                    ) : (
                      <View style={[s.catIcon, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon as never} size={20} color={color} />
                      </View>
                    )}
                    <View style={s.flowRowBody}>
                      <Text style={[s.flowRowName, done && s.textDone]} numberOfLines={1}>
                        {expense.name}
                      </Text>
                      <Text style={s.flowRowAmount}>
                        {monthly === 0 ? '不定期' : `${yen(Math.round(monthly))}/月`}
                      </Text>
                    </View>
                  </View>
                  <View style={s.flowRowRight}>
                    <TouchableOpacity
                      style={s.openUrlBtn}
                      onPress={() => Linking.openURL(cancelUrl)}
                      activeOpacity={0.75}
                    >
                      <Text style={s.openUrlText}>
                        {getCancelUrl(expense.name) ? '公式退会ページ' : '退会方法を検索'}
                      </Text>
                      <Ionicons name="open-outline" size={12} color="#3182CE" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.doneCheck, done && s.doneCheckDone]}
                      onPress={() => toggleCancelDone(expense.id)}
                      activeOpacity={0.75}
                    >
                      {done
                        ? <><Ionicons name="checkmark-circle" size={16} color="#48BB78" /><Text style={s.doneCheckTextDone}>退会した</Text></>
                        : <Text style={s.doneCheckText}>退会した</Text>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* 削除ボタン */}
          <View style={[s.flowFooter, { paddingBottom: insets.bottom + 12 }]}>
            {cancelDoneIds.size > 0 && (
              <Text style={s.flowFooterHint}>{cancelDoneIds.size}件が退会済み</Text>
            )}
            <TouchableOpacity
              style={[s.bulkDeleteBtn, cancelDoneIds.size === 0 && s.bulkDeleteBtnDisabled]}
              onPress={handleBulkDelete}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={cancelDoneIds.size > 0 ? '#fff' : '#A0AEC0'} />
              <Text style={[s.bulkDeleteBtnText, cancelDoneIds.size === 0 && s.bulkDeleteBtnTextDisabled]}>
                退会済みを一括削除
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── スタイル ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#F5F6FA' },
  header:           { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  headerTitle:      { fontSize: 22, fontWeight: '800', color: '#1A202C' },
  scrollView:       { flex: 1 },
  scrollContent:    { padding: 16, gap: 12 },

  // 一覧
  listSection:      { gap: 8 },
  listHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  listTitle:        { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  listCount:        { fontSize: 13, color: '#A0AEC0' },

  row:              { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  rowChecked:       { backgroundColor: '#FFF5F5', borderLeftColor: '#FC5A5A' },
  rowBody:          { flex: 1 },
  rowName:          { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  rowRight:         { alignItems: 'flex-end' },
  rowAmount:        { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  rowAmountSub:     { fontSize: 11, color: '#A0AEC0', marginTop: 1 },

  checkbox:         { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E0', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked:  { backgroundColor: '#FC5A5A', borderColor: '#FC5A5A' },
  catIcon:          { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // 合計カード
  summaryCard:      { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  summaryRow:       { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  summaryAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  summaryLabel:     { fontSize: 13, color: '#718096', fontWeight: '600' },
  summaryAmount:         { fontSize: 28, fontWeight: '800', color: '#1A202C' },
  summaryAmountReducing: { color: '#FC5A5A' },
  summarySub:       { fontSize: 13, color: '#A0AEC0' },
  reductionRow:     { gap: 6, marginTop: 10 },
  reductionDivider: { height: 1, backgroundColor: '#EDF2F7', marginBottom: 4 },
  reductionLabel:   { fontSize: 13, color: '#FC5A5A', fontWeight: '600' },
  reductionAmount:  { fontSize: 22, fontWeight: '800', color: '#FC5A5A' },

  // ボトムバー
  bottomBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', gap: 10 },
  cancelFlowBtn:    { flex: 1, backgroundColor: '#374151', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  cancelFlowBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },
  quickDeleteBtn:   { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#FC5A5A', justifyContent: 'center', alignItems: 'center' },

  // 退会フロー
  flowPanel:        { ...StyleSheet.absoluteFillObject, backgroundColor: '#F5F6FA' },
  flowHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  flowBack:         { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  flowTitle:        { fontSize: 17, fontWeight: '700', color: '#1A202C' },
  flowHint:         { fontSize: 12, color: '#A0AEC0', textAlign: 'center', paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  flowContent:      { padding: 16, gap: 10 },

  flowRow:          { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  flowRowDone:      { backgroundColor: '#F0FFF4', opacity: 0.8 },
  flowRowLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flowRowBody:      { flex: 1 },
  flowRowName:      { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  flowRowAmount:    { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  flowRowRight:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },

  openUrlBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF8FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  openUrlText:      { fontSize: 12, fontWeight: '600', color: '#3182CE' },

  doneCheck:        { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#CBD5E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  doneCheckDone:    { borderColor: '#48BB78', backgroundColor: '#F0FFF4' },
  doneCheckText:    { fontSize: 12, fontWeight: '600', color: '#A0AEC0' },
  doneCheckTextDone:{ fontSize: 12, fontWeight: '700', color: '#48BB78' },

  // フッター
  flowFooter:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingHorizontal: 20, paddingTop: 12 },
  flowFooterHint:   { fontSize: 13, color: '#48BB78', fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  bulkDeleteBtn:    { backgroundColor: '#FC5A5A', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bulkDeleteBtnDisabled: { backgroundColor: '#F7FAFC' },
  bulkDeleteBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },
  bulkDeleteBtnTextDisabled: { color: '#A0AEC0' },

  // カラー
  textRed:          { color: '#FC5A5A' },
  textDone:         { color: '#A0AEC0', textDecorationLine: 'line-through' },

  // 空状態
  empty:            { alignItems: 'center', paddingVertical: 60, gap: 10, backgroundColor: '#fff', borderRadius: 16 },
  emptyTitle:       { fontSize: 16, fontWeight: '600', color: '#CBD5E0' },
  emptySub:         { fontSize: 13, color: '#CBD5E0' },
});
