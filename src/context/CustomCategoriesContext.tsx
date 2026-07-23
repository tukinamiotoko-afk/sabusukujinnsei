import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from './ExpensesContext';

export interface CustomCategory {
  id: string;
  label: string;
  color: string;
}

const PALETTE = [
  '#E53E3E','#DD6B20','#D69E2E','#38A169',
  '#3182CE','#6C63FF','#805AD5','#D53F8C',
  '#2C7A7B','#0EA5E9','#38B2AC','#B7791F',
];

const KEY_CATS  = '@custom_categories_v1';
const KEY_ORDER = '@category_order_v1';

// built-in category keys (excluding 'custom' sentinel)
const BUILTIN = CATEGORIES.filter(c => c !== 'custom');

interface Ctx {
  customCategories: CustomCategory[];
  categoryOrder: string[];       // built-in keys + custom IDs, in display order
  addCategory: (label: string) => void;
  removeCategory: (id: string) => void;
  reorder: (from: number, to: number) => void;
}

const CustomCategoriesContext = createContext<Ctx>({
  customCategories: [],
  categoryOrder: BUILTIN,
  addCategory: () => {},
  removeCategory: () => {},
  reorder: () => {},
});

export function CustomCategoriesProvider({ children }: { children: React.ReactNode }) {
  const [cats, setCats]       = useState<CustomCategory[]>([]);
  const [order, setOrder]     = useState<string[]>(BUILTIN);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY_CATS), AsyncStorage.getItem(KEY_ORDER)]).then(([cj, oj]) => {
      const loadedCats: CustomCategory[] = cj ? JSON.parse(cj) : [];
      setCats(loadedCats);

      if (oj) {
        const saved: string[] = JSON.parse(oj);
        // keep only entries that still exist; append any newly added builtins
        const valid = saved.filter(id => BUILTIN.includes(id as never) || loadedCats.some(c => c.id === id));
        const missing = BUILTIN.filter(k => !valid.includes(k));
        setOrder([...valid, ...missing]);
      } else {
        setOrder([...loadedCats.map(c => c.id), ...BUILTIN]);
      }
    });
  }, []);

  const persistCats = (next: CustomCategory[]) => { setCats(next); AsyncStorage.setItem(KEY_CATS, JSON.stringify(next)); };
  const persistOrder = (next: string[])         => { setOrder(next); AsyncStorage.setItem(KEY_ORDER, JSON.stringify(next)); };

  const addCategory = (label: string) => {
    const color = PALETTE[cats.length % PALETTE.length];
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    persistCats([{ id, label, color }, ...cats]);
    persistOrder([id, ...order]);
  };

  const removeCategory = (id: string) => {
    persistCats(cats.filter(c => c.id !== id));
    persistOrder(order.filter(k => k !== id));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };

  return (
    <CustomCategoriesContext.Provider value={{ customCategories: cats, categoryOrder: order, addCategory, removeCategory, reorder }}>
      {children}
    </CustomCategoriesContext.Provider>
  );
}

export function useCustomCategories() {
  return useContext(CustomCategoriesContext);
}
