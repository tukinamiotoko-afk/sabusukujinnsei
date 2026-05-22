import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, COLORS, CYCLE_LABELS } from '../constants';
import { formatDate, formatCurrency, getDaysUntil } from '../utils/calculations';

interface Props {
  expense: Expense;
  onPress: () => void;
}

export function ExpenseCard({ expense, onPress }: Props) {
  const color = CATEGORY_COLORS[expense.category];
  const icon = CATEGORY_ICONS[expense.category];
  const daysUntil = getDaysUntil(expense.nextDate);
  const isOverdue = daysUntil < 0;
  const isSoon = daysUntil >= 0 && daysUntil <= 7;

  const dateLabel = isOverdue
    ? `${Math.abs(daysUntil)}日超過`
    : daysUntil === 0
    ? '今日'
    : `${daysUntil}日後`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as never} size={22} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{expense.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.cycle}>{CYCLE_LABELS[expense.cycle]}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={[
            styles.dateLabel,
            isOverdue && styles.overdue,
            isSoon && !isOverdue && styles.soon,
          ]}>
            {formatDate(expense.nextDate)}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Text style={[
          styles.daysLabel,
          isOverdue && styles.overdue,
          isSoon && !isOverdue && styles.soon,
        ]}>
          {dateLabel}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.border} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cycle: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  dot: {
    fontSize: 12,
    color: COLORS.border,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  right: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  daysLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    marginTop: 2,
  },
  overdue: {
    color: '#FC5A5A',
  },
  soon: {
    color: '#FF8C42',
  },
  chevron: {
    marginLeft: 2,
  },
});
