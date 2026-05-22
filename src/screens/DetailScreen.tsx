import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { deleteExpense, updateExpense } from '../utils/storage';
import {
  formatCurrency,
  formatDateFull,
  getDaysUntil,
  getAnnualEquivalent,
  getMonthlyEquivalent,
  calculateNextDate,
} from '../utils/calculations';
import {
  COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CYCLE_LABELS,
} from '../constants';
import { CategoryBadge } from '../components/CategoryBadge';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Detail'>;
  route: RouteProp<RootStackParamList, 'Detail'>;
};

export function DetailScreen({ navigation, route }: Props) {
  const [expense, setExpense] = useState(route.params.expense);
  const color = CATEGORY_COLORS[expense.category];
  const icon = CATEGORY_ICONS[expense.category];
  const daysUntil = getDaysUntil(expense.nextDate);
  const isOverdue = daysUntil < 0;

  const handleDelete = () => {
    Alert.alert(
      '削除の確認',
      `「${expense.name}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(expense.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleMarkPaid = async () => {
    if (expense.cycle === 'irregular') {
      Alert.alert('不定期支出', '次回の日付を手動で更新してください。');
      navigation.navigate('AddEdit', { expense });
      return;
    }
    const nextDate = calculateNextDate(new Date(expense.nextDate), expense.cycle);
    const updated = {
      ...expense,
      nextDate: nextDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await updateExpense(updated);
    setExpense(updated);
    Alert.alert('完了', `次回予定日を\n${formatDateFull(updated.nextDate)}\nに更新しました。`);
  };

  return (
    <View style={styles.container}>
      {/* Nav Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>詳細</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEdit', { expense })}
          style={styles.navEdit}
        >
          <Text style={styles.navEditText}>編集</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <LinearGradient
          colors={[color + 'DD', color]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroIconWrap}>
            <Ionicons name={icon as never} size={32} color={color} />
          </View>
          <Text style={styles.heroName}>{expense.name}</Text>
          <Text style={styles.heroAmount}>{formatCurrency(expense.amount)}</Text>
          <CategoryBadge category={expense.category} size="md" />
        </LinearGradient>

        <View style={styles.body}>
          {/* Info Grid */}
          <View style={styles.infoCard}>
            <InfoRow
              icon="repeat-outline"
              label="支払周期"
              value={CYCLE_LABELS[expense.cycle]}
            />
            <Divider />
            <InfoRow
              icon="calendar-outline"
              label="次回予定日"
              value={formatDateFull(expense.nextDate)}
              valueStyle={isOverdue ? styles.overdue : undefined}
            />
            <Divider />
            <InfoRow
              icon="time-outline"
              label="残り日数"
              value={
                isOverdue
                  ? `${Math.abs(daysUntil)}日超過`
                  : daysUntil === 0
                  ? '今日'
                  : `あと${daysUntil}日`
              }
              valueStyle={isOverdue ? styles.overdue : daysUntil <= 7 ? styles.soon : undefined}
            />
          </View>

          {/* Annual estimate */}
          <View style={styles.infoCard}>
            <InfoRow
              icon="trending-up-outline"
              label="月額換算"
              value={formatCurrency(Math.round(getMonthlyEquivalent(expense.amount, expense.cycle)))}
            />
            <Divider />
            <InfoRow
              icon="calculator-outline"
              label="年間見込み"
              value={formatCurrency(Math.round(getAnnualEquivalent(expense.amount, expense.cycle)))}
            />
          </View>

          {/* Memo */}
          {expense.memo ? (
            <View style={styles.memoCard}>
              <View style={styles.memoHeader}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.subtext} />
                <Text style={styles.memoLabel}>メモ</Text>
              </View>
              <Text style={styles.memoText}>{expense.memo}</Text>
            </View>
          ) : null}

          {/* Mark Paid Button */}
          <TouchableOpacity style={styles.paidButton} onPress={handleMarkPaid} activeOpacity={0.8}>
            <LinearGradient
              colors={['#48BB78', '#38A169']}
              style={styles.paidGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.paidButtonText}>支払い済みにする</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={18} color="#FC5A5A" />
            <Text style={styles.deleteText}>この支出を削除</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: string;
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Ionicons name={icon as never} size={16} color={COLORS.subtext} />
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      <Text style={[rowStyles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 2 }} />;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
});

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
  navEdit: {
    padding: 4,
  },
  navEditText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  body: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  memoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  memoText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  paidButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  paidGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  paidButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FC5A5A',
    gap: 6,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FC5A5A',
  },
  overdue: {
    color: '#FC5A5A',
  },
  soon: {
    color: '#FF8C42',
  },
});
