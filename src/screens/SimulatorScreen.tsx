import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useExpenses,
  CAT,
  monthlyEq,
  cycleDisplay,
  CATEGORIES,
  type Category,
  type Expense,
} from '../context/ExpensesContext';
import ServiceIcon, { hasServiceIcon } from '../components/ServiceIcon';

// ─── ユーティリティ ──────────────────────────────────────────────────────────

const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;

// ─── SimulatorScreen ─────────────────────────────────────────────────────────

export default function SimulatorScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, setExpenses } = useExpenses();

  const [targetInput, setTargetInput] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const targetAmount = parseInt(targetInput.replace(/[^0-9]/g, ''), 10) || 0;

  // 月額換算、irregular は 0 として末尾に
  const sortedExpenses = useMemo(() => {
    const withMonthly = expenses.map(e => ({
      expense: e,
      monthly: monthlyEq(e.amount, e.cycle, e.customCycleDays),
    }));
    return withMonthly.sort((a, b) => {
      if (a.monthly === 0 && b.monthly === 0) return 0;
      if (a.monthly === 0) return 1;
      if (b.monthly === 0) return -1;
      return b.monthly - a.monthly;
    });
  }, [expenses]);

  const totalReduction = useMemo(() => {
    return sortedExpenses
      .filter(({ expense }) => checkedIds.has(expense.id))
      .reduce((sum, { monthly }) => sum + monthly, 0);
  }, [sortedExpenses, checkedIds]);

  const remaining = targetAmount - totalReduction;
  const achieved = targetAmount > 0 && totalReduction >= targetAmount;
  const progressRatio =
    targetAmount > 0 ? Math.min(totalReduction / targetAmount, 1) : 0;

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    const count = checkedIds.size;
    Alert.alert(
      '削除の確認',
      `チェックした${count}件を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            setExpenses(prev => prev.filter(e => !checkedIds.has(e.id)));
            setCheckedIds(new Set());
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + (checkedIds.size > 0 ? 100 : 24) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 目標入力 */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>削減したい月額（円）</Text>
          <View style={s.inputRow}>
            <Text style={s.yenSign}>¥</Text>
            <TextInput
              style={s.targetInput}
              value={targetInput}
              onChangeText={v => setTargetInput(v.replace(/[^0-9]/g, ''))}
              placeholder="例：10000"
              placeholderTextColor="#CBD5E0"
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* 進捗バー + ステータス */}
        <View style={s.card}>
          <View style={s.progressHeader}>
            <Text style={s.progressLabel}>削減合計</Text>
            <Text style={[s.progressAmount, achieved && s.textGreen]}>
              {yen(Math.round(totalReduction))}
            </Text>
          </View>

          {/* バー背景 */}
          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                {
                  width: `${progressRatio * 100}%`,
                  backgroundColor: achieved ? '#48BB78' : '#F6AD55',
                },
              ]}
            />
          </View>

          {/* ステータス行 */}
          {targetAmount > 0 ? (
            achieved ? (
              <View style={s.statusRow}>
                <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
                <Text style={[s.statusText, s.textGreen]}>
                  目標達成！（余剰 {yen(Math.round(totalReduction - targetAmount))}）
                </Text>
              </View>
            ) : (
              <View style={s.statusRow}>
                <Ionicons name="arrow-up-circle-outline" size={18} color="#F6AD55" />
                <Text style={[s.statusText, s.textOrange]}>
                  あと {yen(Math.round(remaining))}
                </Text>
              </View>
            )
          ) : (
            <Text style={s.statusHint}>上の入力欄に目標金額を入力してください</Text>
          )}
        </View>

        {/* 固定費一覧 */}
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
              const { label, color, icon } = CAT[expense.category];
              return (
                <TouchableOpacity
                  key={expense.id}
                  style={[s.row, checked && s.rowChecked]}
                  onPress={() => toggleCheck(expense.id)}
                  activeOpacity={0.75}
                >
                  {/* チェックボックス */}
                  <View style={[s.checkbox, checked && s.checkboxChecked]}>
                    {checked && (
                      <Ionicons name="checkmark" size={13} color="#fff" />
                    )}
                  </View>

                  {/* アイコン */}
                  {hasServiceIcon(expense.name) ? (
                    <ServiceIcon name={expense.name} size={40} />
                  ) : (
                    <View style={[s.catIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon as never} size={20} color={color} />
                    </View>
                  )}

                  {/* 本文 */}
                  <View style={s.rowBody}>
                    <Text style={s.rowName} numberOfLines={1}>{expense.name}</Text>
                    <View style={s.rowMeta}>
                      <View style={[s.catBadge, { backgroundColor: color + '18' }]}>
                        <Text style={[s.catBadgeText, { color }]}>{label}</Text>
                      </View>
                      <Text style={s.cycleText}>
                        {cycleDisplay(expense.cycle, expense.customCycleDays)}
                      </Text>
                    </View>
                  </View>

                  {/* 月額 */}
                  <View style={s.rowRight}>
                    <Text style={[s.rowAmount, checked && s.textRed]}>
                      {monthly === 0 ? '不定期' : yen(Math.round(monthly))}
                    </Text>
                    {monthly !== 0 && (
                      <Text style={s.rowAmountSub}>/月</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {checkedIds.size > 0 && (
        <View style={[s.deleteBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={s.deleteBtnText}>{checkedIds.size}件を削除する</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── スタイル ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#F5F6FA' },

  // スクロール
  scrollView:       { flex: 1 },
  scrollContent:    { padding: 16, gap: 12 },

  // カード共通
  card:             { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  // 目標入力
  sectionLabel:     { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  inputRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FC', borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', paddingLeft: 14 },
  yenSign:          { fontSize: 18, fontWeight: '700', color: '#718096' },
  targetInput:      { flex: 1, fontSize: 22, fontWeight: '700', color: '#1A202C', paddingVertical: 12, paddingHorizontal: 8 },

  // 進捗
  progressHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel:    { fontSize: 13, fontWeight: '600', color: '#718096' },
  progressAmount:   { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  progressTrack:    { height: 10, backgroundColor: '#EDF2F7', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressFill:     { height: '100%', borderRadius: 5 },
  statusRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText:       { fontSize: 14, fontWeight: '700' },
  statusHint:       { fontSize: 13, color: '#A0AEC0', textAlign: 'center', paddingVertical: 2 },

  // 一覧セクション
  listSection:      { gap: 8 },
  listHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  listTitle:        { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  listCount:        { fontSize: 13, color: '#A0AEC0' },

  // 行
  row:              { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  rowChecked:       { backgroundColor: '#FFF5F5', borderLeftColor: '#FC5A5A' },
  rowBody:          { flex: 1, gap: 4 },
  rowName:          { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  rowMeta:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowRight:         { alignItems: 'flex-end' },
  rowAmount:        { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  rowAmountSub:     { fontSize: 11, color: '#A0AEC0', marginTop: 1 },

  // チェックボックス
  checkbox:         { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E0', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked:  { backgroundColor: '#FC5A5A', borderColor: '#FC5A5A' },

  // カテゴリアイコン
  catIcon:          { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catBadge:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  catBadgeText:     { fontSize: 11, fontWeight: '700' },
  cycleText:        { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },

  // カラー
  textGreen:        { color: '#48BB78' },
  textOrange:       { color: '#F6AD55' },
  textRed:          { color: '#FC5A5A' },

  // 削除バー
  deleteBar:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingHorizontal: 20, paddingTop: 12 },
  deleteBtn:        { backgroundColor: '#FC5A5A', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteBtnText:    { fontSize: 16, fontWeight: '700', color: '#fff' },

  // 空状態
  empty:            { alignItems: 'center', paddingVertical: 60, gap: 10, backgroundColor: '#fff', borderRadius: 16 },
  emptyTitle:       { fontSize: 16, fontWeight: '600', color: '#CBD5E0' },
  emptySub:         { fontSize: 13, color: '#CBD5E0' },
});
