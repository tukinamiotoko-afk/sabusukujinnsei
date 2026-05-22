import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types';

const STORAGE_KEY = '@fixed_expenses';

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export async function addExpense(expense: Expense): Promise<Expense[]> {
  const expenses = await loadExpenses();
  const updated = [...expenses, expense];
  await saveExpenses(updated);
  return updated;
}

export async function updateExpense(expense: Expense): Promise<Expense[]> {
  const expenses = await loadExpenses();
  const updated = expenses.map(e => (e.id === expense.id ? expense : e));
  await saveExpenses(updated);
  return updated;
}

export async function deleteExpense(id: string): Promise<Expense[]> {
  const expenses = await loadExpenses();
  const updated = expenses.filter(e => e.id !== id);
  await saveExpenses(updated);
  return updated;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
