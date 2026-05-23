import React, { createContext, useContext, useState } from 'react';

export type Category =
  | 'subscription' | 'hospital' | 'medicine'
  | 'haircut' | 'protein' | 'telecom' | 'other';

export type Cycle =
  | 'weekly' | 'monthly' | 'yearly'
  | 'every30days' | 'every45days'
  | 'every2months' | 'every3months' | 'irregular' | 'custom';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  cycle: Cycle;
  customCycleDays?: number;
  nextDate: string;
  memo: string;
}

interface ExpensesContextType {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  setExpenses: () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  return (
    <ExpensesContext.Provider value={{ expenses, setExpenses }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpensesContext);
}

// ── 共通ユーティリティ ─────────────────────────────────────────────────────────

export const CAT: Record<Category, { label: string; color: string; icon: string }> = {
  subscription: { label: 'サブスク',    color: '#6C63FF', icon: 'tv-outline' },
  hospital:     { label: '病院',        color: '#F56565', icon: 'medical-outline' },
  medicine:     { label: '薬',          color: '#4299E1', icon: 'flask-outline' },
  haircut:      { label: '散髪',        color: '#ED64A6', icon: 'cut-outline' },
  protein:      { label: 'プロテイン',  color: '#F6AD55', icon: 'fitness-outline' },
  telecom:      { label: '通信費',      color: '#38B2AC', icon: 'phone-portrait-outline' },
  other:        { label: 'その他',      color: '#A0AEC0', icon: 'apps-outline' },
};

export const CYCLE_LABEL: Record<Cycle, string> = {
  weekly:       '毎週',
  monthly:      '毎月',
  yearly:       '毎年',
  every30days:  '30日ごと',
  every45days:  '45日ごと',
  every2months: '2か月ごと',
  every3months: '3か月ごと',
  irregular:    '不定期',
  custom:       'カスタム',
};

export function cycleDisplay(cycle: Cycle, customDays?: number): string {
  if (cycle === 'custom' && customDays) return `${customDays}日ごと`;
  return CYCLE_LABEL[cycle];
}

export function monthlyEq(amount: number, cycle: Cycle, customDays?: number): number {
  if (cycle === 'custom') {
    const d = customDays && customDays > 0 ? customDays : 30;
    return (amount * 365) / d / 12;
  }
  const table: Record<Cycle, number> = {
    weekly:       (amount * 52) / 12,
    monthly:      amount,
    yearly:       amount / 12,
    every30days:  amount,
    every45days:  (amount * 365) / 45 / 12,
    every2months: amount / 2,
    every3months: amount / 3,
    irregular:    0,
    custom:       0,
  };
  return table[cycle];
}

export function isPaymentOnDate(expense: Expense, date: Date): boolean {
  const base = new Date(expense.nextDate);
  base.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const lastDay = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

  switch (expense.cycle) {
    case 'irregular':
      return base.getTime() === target.getTime();

    case 'monthly':
      return target.getDate() === Math.min(base.getDate(), lastDay(target.getFullYear(), target.getMonth()));

    case 'yearly':
      return base.getMonth() === target.getMonth() && base.getDate() === target.getDate();

    case 'every2months': {
      const md = (target.getFullYear() - base.getFullYear()) * 12 + (target.getMonth() - base.getMonth());
      return md % 2 === 0 &&
        target.getDate() === Math.min(base.getDate(), lastDay(target.getFullYear(), target.getMonth()));
    }

    case 'every3months': {
      const md = (target.getFullYear() - base.getFullYear()) * 12 + (target.getMonth() - base.getMonth());
      return md % 3 === 0 &&
        target.getDate() === Math.min(base.getDate(), lastDay(target.getFullYear(), target.getMonth()));
    }

    case 'weekly': {
      const diff = Math.round((target.getTime() - base.getTime()) / 86400000);
      return diff % 7 === 0;
    }

    case 'every30days': {
      const diff = Math.round((target.getTime() - base.getTime()) / 86400000);
      return diff % 30 === 0;
    }

    case 'every45days': {
      const diff = Math.round((target.getTime() - base.getTime()) / 86400000);
      return diff % 45 === 0;
    }

    case 'custom': {
      const days = expense.customCycleDays && expense.customCycleDays > 0 ? expense.customCycleDays : 30;
      const diff = Math.round((target.getTime() - base.getTime()) / 86400000);
      return diff % days === 0;
    }

    default:
      return false;
  }
}

export const CATEGORIES = Object.keys(CAT) as Category[];
export const CYCLES = Object.keys(CYCLE_LABEL) as Cycle[];
