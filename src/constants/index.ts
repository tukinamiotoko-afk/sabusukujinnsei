import { PaymentCycle, Category } from '../types';

export const CYCLE_LABELS: Record<PaymentCycle, string> = {
  weekly: '毎週',
  monthly: '毎月',
  yearly: '毎年',
  every30days: '30日ごと',
  every45days: '45日ごと',
  every2months: '2か月ごと',
  every3months: '3か月ごと',
  irregular: '不定期',
};

export const CYCLES: PaymentCycle[] = [
  'weekly',
  'monthly',
  'yearly',
  'every30days',
  'every45days',
  'every2months',
  'every3months',
  'irregular',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  subscription: 'サブスク',
  health: '健康・医療',
  beauty: '美容',
  food: '食料品',
  utilities: '光熱費',
  insurance: '保険',
  entertainment: '娯楽',
  other: 'その他',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  subscription: '#6C63FF',
  health: '#48BB78',
  beauty: '#ED64A6',
  food: '#ED8936',
  utilities: '#4299E1',
  insurance: '#9F7AEA',
  entertainment: '#F6AD55',
  other: '#A0AEC0',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  subscription: 'tv-outline',
  health: 'medical-outline',
  beauty: 'cut-outline',
  food: 'nutrition-outline',
  utilities: 'flash-outline',
  insurance: 'shield-checkmark-outline',
  entertainment: 'game-controller-outline',
  other: 'apps-outline',
};

export const CATEGORIES: Category[] = [
  'subscription',
  'health',
  'beauty',
  'food',
  'utilities',
  'insurance',
  'entertainment',
  'other',
];

export const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#EEF2FF',
  secondary: '#FF6584',
  success: '#48BB78',
  warning: '#F6AD55',
  background: '#F5F6FA',
  card: '#FFFFFF',
  text: '#1A202C',
  subtext: '#718096',
  border: '#E2E8F0',
  white: '#FFFFFF',
};
