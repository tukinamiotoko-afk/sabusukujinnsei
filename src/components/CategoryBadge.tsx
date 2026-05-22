import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '../constants';

interface Props {
  category: Category;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: Props) {
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon as never} size={isSmall ? 11 : 13} color={color} />
      <Text style={[styles.label, { color, fontSize: isSmall ? 11 : 12 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
});
