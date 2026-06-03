import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, type NotifyTarget, type DaysBefore } from '../context/SettingsContext';
import { useExpenses } from '../context/ExpensesContext';
import {
  requestNotificationPermission,
  scheduleExpenseNotifications,
} from '../utils/notifications';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { notifSettings, setNotifSettings } = useSettings();
  const { expenses } = useExpenses();

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
    }
    setNotifSettings({ ...notifSettings, enabled: val });
  };

  const TARGET_OPTIONS: { value: NotifyTarget; label: string; sub: string }[] = [
    { value: 'all',          label: 'すべて',           sub: 'サブスク・固定費の両方' },
    { value: 'subscription', label: 'サブスクのみ',    sub: 'サブスクリプションだけ通知' },
    { value: 'fixed',        label: '固定費のみ',       sub: 'サブスク以外を通知' },
  ];

  const DAYS_OPTIONS: { value: DaysBefore; label: string }[] = [
    { value: 0, label: '当日' },
    { value: 1, label: '1日前' },
    { value: 3, label: '3日前' },
    { value: 7, label: '7日前' },
  ];

  return (
    <View style={c.root}>
      <View style={[c.header, { paddingTop: insets.top + 12 }]}>
        <Text style={c.screenTitle}>設定</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={c.subTitle}>通知タイミング</Text>
            <View style={c.daysRow}>
              {DAYS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[c.dayBtn, notifSettings.daysBefore === opt.value && c.dayBtnActive]}
                  onPress={() => notifSettings.enabled && setNotifSettings({ ...notifSettings, daysBefore: opt.value })}
                  activeOpacity={0.7}
                >
                  <Text style={[c.dayBtnTxt, notifSettings.daysBefore === opt.value && c.dayBtnTxtActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
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
  daysRow:        { flexDirection: 'row', gap: 8 },
  dayBtn:         { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  dayBtnActive:   { backgroundColor: '#475569' },
  dayBtnTxt:      { fontSize: 13, fontWeight: '600', color: '#64748B' },
  dayBtnTxtActive:{ color: '#fff' },
  version:        { textAlign: 'center', fontSize: 12, color: '#CBD5E0', marginTop: 8 },
});
