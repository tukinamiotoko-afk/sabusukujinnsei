export type PaymentCycle =
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'every30days'
  | 'every45days'
  | 'every2months'
  | 'every3months'
  | 'irregular';

export type Category =
  | 'subscription'
  | 'health'
  | 'beauty'
  | 'food'
  | 'utilities'
  | 'insurance'
  | 'entertainment'
  | 'other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  cycle: PaymentCycle;
  nextDate: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddEdit: { expense?: Expense };
  Detail: { expense: Expense };
};
