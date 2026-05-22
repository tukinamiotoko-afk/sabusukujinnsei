import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RootStackParamList, Category, PaymentCycle, Expense } from '../types';
import { addExpense, updateExpense, generateId } from '../utils/storage';
import {
  COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORIES,
  CYCLES,
  CYCLE_LABELS,
} from '../constants';
import { PickerModal } from '../components/PickerModal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddEdit'>;
  route: RouteProp<RootStackParamList, 'AddEdit'>;
};

export function AddEditScreen({ navigation, route }: Props) {
  const editing = route.params?.expense;

  const [name, setName] = useState(editing?.name ?? '');
  const [amountStr, setAmountStr] = useState(editing?.amount.toString() ?? '');
  const [category, setCategory] = useState<Category>(editing?.category ?? 'other');
  const [cycle, setCycle] = useState<PaymentCycle>(editing?.cycle ?? 'monthly');
  const [nextDate, setNextDate] = useState<Date>(
    editing?.nextDate ? parseISO(editing.nextDate) : new Date()
  );
  const [memo, setMemo] = useState(editing?.memo ?? '');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCyclePicker, setShowCyclePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const amount = parseInt(amountStr.replace(/,/g, ''), 10);
  const isValid = name.trim().length > 0 && !isNaN(amount) && amount > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const expense: Expense = {
        id: editing?.id ?? generateId(),
        name: name.trim(),
        amount,
        category,
        cycle,
        nextDate: nextDate.toISOString(),
        memo: memo.trim(),
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      };
      if (editing) {
        await updateExpense(expense);
      } else {
        await addExpense(expense);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = CATEGORIES.map(cat => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
    color: CATEGORY_COLORS[cat],
    icon: CATEGORY_ICONS[cat],
  }));

  const cycleOptions = CYCLES.map(c => ({
    value: c,
    label: CYCLE_LABELS[c],
  }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Nav Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBack}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{editing ? '支出を編集' : '支出を追加'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid || saving}
            style={[styles.navSave, (!isValid || saving) && styles.navSaveDisabled]}
          >
            <Text style={[styles.navSaveText, (!isValid || saving) && styles.navSaveTextDisabled]}>
              保存
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>名前 <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="例：Netflix、散髪、プロテイン"
                placeholderTextColor={COLORS.border}
                returnKeyType="next"
              />
            </View>

            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>金額（円） <Text style={styles.required}>*</Text></Text>
              <View style={styles.amountWrap}>
                <Text style={styles.yen}>¥</Text>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  value={amountStr}
                  onChangeText={setAmountStr}
                  placeholder="0"
                  placeholderTextColor={COLORS.border}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.field}>
              <Text style={styles.label}>カテゴリ</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCategoryPicker(true)}
              >
                <View style={[styles.selectorIcon, { backgroundColor: CATEGORY_COLORS[category] + '18' }]}>
                  <Ionicons name={CATEGORY_ICONS[category] as never} size={18} color={CATEGORY_COLORS[category]} />
                </View>
                <Text style={styles.selectorText}>{CATEGORY_LABELS[category]}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>

            {/* Cycle */}
            <View style={styles.field}>
              <Text style={styles.label}>支払周期</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCyclePicker(true)}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons name="repeat" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.selectorText}>{CYCLE_LABELS[cycle]}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>

            {/* Next Date */}
            <View style={styles.field}>
              <Text style={styles.label}>次回予定日</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.selectorIcon}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.selectorText}>
                  {format(nextDate, 'yyyy年M月d日(E)', { locale: ja })}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>

            {/* Date Picker (inline on iOS, modal on Android) */}
            {showDatePicker && (
              <DateTimePicker
                value={nextDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                locale="ja-JP"
                onChange={(_, selected) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (selected) setNextDate(selected);
                }}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <TouchableOpacity
                style={styles.dateConfirm}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.dateConfirmText}>完了</Text>
              </TouchableOpacity>
            )}

            {/* Memo */}
            <View style={styles.field}>
              <Text style={styles.label}>メモ</Text>
              <TextInput
                style={[styles.input, styles.memoInput]}
                value={memo}
                onChangeText={setMemo}
                placeholder="任意のメモ"
                placeholderTextColor={COLORS.border}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <PickerModal
          visible={showCategoryPicker}
          title="カテゴリを選択"
          options={categoryOptions}
          selected={category}
          onSelect={setCategory}
          onClose={() => setShowCategoryPicker(false)}
        />
        <PickerModal
          visible={showCyclePicker}
          title="支払周期を選択"
          options={cycleOptions}
          selected={cycle}
          onSelect={setCycle}
          onClose={() => setShowCyclePicker(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBack: {
    padding: 4,
  },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  navSave: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  navSaveDisabled: {
    opacity: 0.4,
  },
  navSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  navSaveTextDisabled: {
    color: COLORS.subtext,
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subtext,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: COLORS.secondary,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: 14,
  },
  yen: {
    fontSize: 18,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 10,
  },
  selectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  memoInput: {
    minHeight: 90,
    paddingTop: 13,
  },
  dateConfirm: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: -12,
    marginBottom: 4,
  },
  dateConfirmText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
