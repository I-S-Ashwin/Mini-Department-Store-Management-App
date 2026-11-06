export type Unit = 'Kg' | 'Litre' | 'Nos';

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Salary'
  | 'Transportation'
  | 'Miscellaneous';

export interface Product {
  id: string;
  name: string;
  unit: Unit;
  openingStock: number;
  openingRate: number;
  stock: number;
  createdAt?: number;
  updatedAt?: number;
}

export type TransactionType = 'sale' | 'purchase' | 'expense';

export interface StoreTransaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  total: number;
  createdAt: number;

  // Sale & Purchase fields
  productId?: string;
  productName?: string;
  quantity?: number;
  rate?: number;
  unit?: Unit;
  costRate?: number; // Cost price at time of sale (for COGS calculation)
  supplierName?: string; // Purchase only

  // Expense fields
  category?: ExpenseCategory;
  description?: string;
}

export interface DaySummary {
  purchases: number;
  sales: number;
  soldCost: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  totalStockValue: number;
}

