import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const KEY = '@custom_categories_v1';

interface Ctx {
  customCategories: CustomCategory[];
  addCategory: (label: string) => void;
  removeCategory: (id: string) => void;
  reorder: (from: number, to: number) => void;
}

const CustomCategoriesContext = createContext<Ctx>({
  customCategories: [],
  addCategory: () => {},
  removeCategory: () => {},
  reorder: () => {},
});

export function CustomCategoriesProvider({ children }: { children: React.ReactNode }) {
  const [cats, setCats] = useState<CustomCategory[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(json => {
      if (json) setCats(JSON.parse(json));
    });
  }, []);

  const persist = (next: CustomCategory[]) => {
    setCats(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const addCategory = (label: string) => {
    const color = PALETTE[cats.length % PALETTE.length];
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    persist([{ id, label, color }, ...cats]);
  };

  const removeCategory = (id: string) => persist(cats.filter(c => c.id !== id));

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...cats];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persist(next);
  };

  return (
    <CustomCategoriesContext.Provider value={{ customCategories: cats, addCategory, removeCategory, reorder }}>
      {children}
    </CustomCategoriesContext.Provider>
  );
}

export function useCustomCategories() {
  return useContext(CustomCategoriesContext);
}
