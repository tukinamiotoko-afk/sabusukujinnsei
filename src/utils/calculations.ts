import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  differenceInDays,
  format,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { Expense, PaymentCycle, Category } from '../types';

export function getAnnualMultiplier(cycle: PaymentCycle): number {
  switch (cycle) {
    case 'weekly':      return 52;
    case 'monthly':     return 12;
    case 'yearly':      return 1;
    case 'every30days': return 365 / 30;
    case 'every45days': return 365 / 45;
    case 'every2months':return 6;
    case 'every3months':return 4;
    case 'irregular':   return 1;
  }
}

export function getMonthlyEquivalent(amount: number, cycle: PaymentCycle): number {
  if (cycle === 'irregular') return 0;
  return (amount * getAnnualMultiplier(cycle)) / 12;
}

export function getAnnualEquivalent(amount: number, cycle: PaymentCycle): number {
  return amount * getAnnualMultiplier(cycle);
}

export function calculateNextDate(fromDate: Date, cycle: PaymentCycle): Date {
  switch (cycle) {
    case 'weekly':      return addWeeks(fromDate, 1);
    case 'monthly':     return addMonths(fromDate, 1);
    case 'yearly':      return addYears(fromDate, 1);
    case 'every30days': return addDays(fromDate, 30);
    case 'every45days': return addDays(fromDate, 45);
    case 'every2months':return addMonths(fromDate, 2);
    case 'every3months':return addMonths(fromDate, 3);
    case 'irregular':   return fromDate;
  }
}

export function getThisMonthExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return expenses.filter(e => {
    const date = parseISO(e.nextDate);
    return isWithinInterval(date, { start, end });
  });
}

export function getThisMonthTotal(expenses: Expense[]): number {
  return getThisMonthExpenses(expenses).reduce((sum, e) => sum + e.amount, 0);
}

export function getAnnualTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + getAnnualEquivalent(e.amount, e.cycle), 0);
}

export function getNextPayment(expenses: Expense[]): Expense | null {
  const eligible = expenses.filter(e => e.cycle !== 'irregular');
  if (eligible.length === 0) return null;
  return eligible.reduce((nearest, e) =>
    new Date(e.nextDate) < new Date(nearest.nextDate) ? e : nearest
  );
}

export function getCategoryMonthlyTotals(expenses: Expense[]): Record<Category, number> {
  const totals = {} as Record<Category, number>;
  for (const e of expenses) {
    const monthly = getMonthlyEquivalent(e.amount, e.cycle);
    totals[e.category] = (totals[e.category] ?? 0) + monthly;
  }
  return totals;
}

export function getDaysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'M月d日(E)', { locale: ja });
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日(E)', { locale: ja });
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatMonthYear(): string {
  return format(new Date(), 'yyyy年M月', { locale: ja });
}
