import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, type NotifyTarget } from '../context/SettingsContext';
import { useExpenses } from '../context/ExpensesContext';
import { usePro, FREE_LIMIT } from '../context/ProContext';
import {
  requestNotificationPermission,
  scheduleExpenseNotifications,
} from '../utils/notifications';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { notifSettings, setNotifSettings } = useSettings();
  const { expenses } = useExpenses();
  const { isPro, openPaywall } = usePro();
  const [daysInput, setDaysInput] = useState('');

  useEffect(() => {
    scheduleExpenseNotifications(expenses, notifSettings);
  }, [expenses, notifSettings]);

  const toggleEnabled = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('通知の許可が必要です', '設定アプリから通知を許可してください。');
        return;
      }
      const daysBefore = notifSettings.daysBefore.length === 0 ? [0] : notifSettings.daysBefore;
      setNotifSettings({ ...notifSettings, enabled: true, daysBefore });
    } else {
      setNotifSettings({ ...notifSettings, enabled: false });
    }
  };

  const TARGET_OPTIONS: { value: NotifyTarget; label: string; sub: string }[] = [
    { value: 'all',          label: 'すべて',           sub: 'サブスク・固定費の両方' },
    { value: 'subscription', label: 'サブスクのみ',    sub: 'サブスクリプションだけ通知' },
    { value: 'fixed',        label: '固定費のみ',       sub: 'サブスク以外を通知' },
  ];

  const addDay = () => {
    const n = parseInt(daysInput, 10);
    if (!isNaN(n) && n >= 0 && !notifSettings.daysBefore.includes(n)) {
      setNotifSettings({ ...notifSettings, daysBefore: [...notifSettings.daysBefore, n].sort((a, b) => a - b) });
    }
    setDaysInput('');
  };

  const togglePreset = (n: number) => {
    if (!notifSettings.enabled) return;
    const current = notifSettings.daysBefore;
    const next = current.includes(n) ? current.filter(d => d !== n) : [...current, n].sort((a, b) => a - b);
    if (next.length === 0) return;
    setNotifSettings({ ...notifSettings, daysBefore: next });
  };

  const removeDay = (n: number) => {
    const next = notifSettings.daysBefore.filter(d => d !== n);
    if (next.length === 0) {
      setNotifSettings({ ...notifSettings, enabled: false, daysBefore: next });
    } else {
      setNotifSettings({ ...notifSettings, daysBefore: next });
    }
  };

  return (
    <View style={c.root}>
      <View style={[c.header, { paddingTop: insets.top + 12 }]}>
        <Text style={c.screenTitle}>設定</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* プロプラン */}
        <View style={c.section}>
          <Text style={c.sectionTitle}>プロプラン</Text>
          {isPro ? (
            <View style={c.proRow}>
              <View style={c.proIcon}><Ionicons name="star" size={20} color="#475569" /></View>
              <View style={c.rowText}>
                <Text style={c.rowLabel}>プロプラン 契約中</Text>
                <Text style={c.rowSub}>広告なし・登録無制限</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={c.upgradeBtn} onPress={openPaywall} activeOpacity={0.85}>
              <View style={c.proIcon}><Ionicons name="star-outline" size={20} color="#fff" /></View>
              <View style={c.rowText}>
                <Text style={c.upgradeBtnTitle}>プロにアップグレード</Text>
                <Text style={c.upgradeBtnSub}>
                  現在 {expenses.length}/{FREE_LIMIT}件　広告あり → 無制限・広告なしへ
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
        </View>

        {/* 通知セクション */}
        <View style={c.section}>
          <Text style={c.sectionTitle}>通知設定</Text>

          {/* ON/OFF */}
          <View style={c.row}>
            <View style={c.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color="#475569" />
              <View style={c.rowText}>
                <Text style={c.rowLabel}>支払い通知</Text>
                <Text style={c.rowSub}>支払い日前にお知らせします</Text>
              </View>
            </View>
            <Switch
              value={notifSettings.enabled}
              onValueChange={toggleEnabled}
              trackColor={{ false: '#E2E8F0', true: '#475569' }}
              thumbColor="#fff"
            />
          </View>

          {/* 対象 */}
          <View style={[c.subSection, !notifSettings.enabled && c.disabled]}>
            <Text style={c.subTitle}>通知対象</Text>
            {TARGET_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={c.optionRow}
                onPress={() => notifSettings.enabled && setNotifSettings({ ...notifSettings, target: opt.value })}
                activeOpacity={0.7}
              >
                <View style={c.optionText}>
                  <Text style={c.optionLabel}>{opt.label}</Text>
                  <Text style={c.optionSub}>{opt.sub}</Text>
                </View>
                <View style={[c.radio, notifSettings.target === opt.value && c.radioActive]}>
                  {notifSettings.target === opt.value && <View style={c.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 何日前 */}
          <View style={[c.subSection, !notifSettings.enabled && c.disabled]}>
            <Text style={c.subTitle}>通知タイミング（複数可）</Text>
            {/* プリセット */}
            <View style={c.daysPresets}>
              {[0, 1, 3].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[c.presetBtn, notifSettings.daysBefore.includes(n) && c.presetBtnActive]}
                  onPress={() => togglePreset(n)}
                >
                  <Text style={[c.presetTxt, notifSettings.daysBefore.includes(n) && c.presetTxtActive]}>
                    {n === 0 ? '当日' : `${n}日前`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* カスタム入力 */}
            <View style={c.daysInputRow}>
              <TextInput
                style={c.daysInput}
                value={daysInput}
                onChangeText={setDaysInput}
                keyboardType="number-pad"
                maxLength={2}
                editable={notifSettings.enabled}
              />
              <Text style={c.daysInputLabel}>日前</Text>
              <TouchableOpacity style={c.addBtn} onPress={addDay}>
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* 選択済みタグ */}
            <View style={c.selectedDays}>
              {notifSettings.daysBefore.map(n => (
                <View key={n} style={c.dayTag}>
                  <Text style={c.dayTagTxt}>{n === 0 ? '当日' : `${n}日前`}</Text>
                  <TouchableOpacity onPress={() => removeDay(n)} hitSlop={6}>
                    <Ionicons name="close" size={12} color="#475569" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* バージョン */}
        <Text style={c.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const c = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#F8FAFC' },
  header:         { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  screenTitle:    { fontSize: 22, fontWeight: '800', color: '#1A202C' },
  section:        { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionTitle:   { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  rowLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowText:        { gap: 2 },
  rowLabel:       { fontSize: 15, fontWeight: '600', color: '#1A202C' },
  rowSub:         { fontSize: 12, color: '#94A3B8' },
  subSection:     { marginTop: 16 },
  subTitle:       { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 8 },
  disabled:       { opacity: 0.4 },
  optionRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  optionText:     { gap: 2 },
  optionLabel:    { fontSize: 14, fontWeight: '600', color: '#1A202C' },
  optionSub:      { fontSize: 11, color: '#94A3B8' },
  radio:          { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center' },
  radioActive:    { borderColor: '#475569' },
  radioDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#475569' },
  daysPresets:     { flexDirection: 'row', gap: 6, marginBottom: 10 },
  presetBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
  presetBtnActive: { backgroundColor: '#475569' },
  presetTxt:       { fontSize: 12, fontWeight: '600', color: '#64748B' },
  presetTxtActive: { color: '#fff' },
  daysInputRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  daysInput:       { width: 64, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1A202C' },
  daysInputLabel:  { fontSize: 14, color: '#64748B', fontWeight: '500' },
  addBtn:          { width: 36, height: 36, borderRadius: 10, backgroundColor: '#475569', justifyContent: 'center', alignItems: 'center' },
  selectedDays:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayTag:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  dayTagTxt:       { fontSize: 12, fontWeight: '600', color: '#475569' },
  version:        { textAlign: 'center', fontSize: 12, color: '#CBD5E0', marginTop: 8 },

  proRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  proIcon:        { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  upgradeBtn:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#475569', borderRadius: 14, padding: 14 },
  upgradeBtnTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  upgradeBtnSub:  { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
