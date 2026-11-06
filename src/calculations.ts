import { DaySummary, Product, StoreTransaction } from './types';

/**
 * Rounds a number to two decimal places to prevent floating-point inaccuracies.
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Validates that an input is a finite number greater than zero.
 */
export function validatePositive(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a number greater than 0.`);
  }
}

/**
 * Calculates total amount from quantity and unit rate.
 */
export function calculateTotal(quantity: number, rate: number): number {
  validatePositive(quantity, 'Quantity');
  validatePositive(rate, 'Rate');
  return roundToTwo(quantity * rate);
}

/**
 * Rejects a sale when requested quantity exceeds currently available stock.
 */
export function validateSaleStock(availableStock: number, quantityToSell: number): void {
  validatePositive(quantityToSell, 'Sale quantity');
  if (quantityToSell > availableStock) {
    throw new Error(`Insufficient stock! Available: ${availableStock}, requested: ${quantityToSell}.`);
  }
}

/**
 * Computes updated stock level after a purchase.
 */
export function computeStockOnPurchase(currentStock: number, purchaseQty: number): number {
  validatePositive(purchaseQty, 'Purchase quantity');
  return roundToTwo(currentStock + purchaseQty);
}

/**
 * Computes updated stock level after a sale.
 */
export function computeStockOnSale(currentStock: number, saleQty: number): number {
  validateSaleStock(currentStock, saleQty);
  return roundToTwo(currentStock - saleQty);
}

/**
 * Computes financial ledger metrics:
 * - Total Purchases
 * - Total Sales
 * - Estimated Cost of Goods Sold (COGS)
 * - Gross Profit (Sales - COGS)
 * - Total Expenses
 * - Net Profit (Gross Profit - Expenses)
 * - Total Current Stock Valuation
 */
export function computeLedgerSummary(
  transactions: StoreTransaction[],
  products: Product[],
  filterDate?: string
): DaySummary {
  const filtered = filterDate
    ? transactions.filter((t) => t.date === filterDate)
    : transactions;

  let purchases = 0;
  let sales = 0;
  let soldCost = 0;
  let expenses = 0;

  for (const t of filtered) {
    if (t.type === 'purchase') {
      purchases += t.total;
    } else if (t.type === 'sale') {
      sales += t.total;
      const cRate = t.costRate || 0;
      const qty = t.quantity || 0;
      soldCost += roundToTwo(qty * cRate);
    } else if (t.type === 'expense') {
      expenses += t.total;
    }
  }

  purchases = roundToTwo(purchases);
  sales = roundToTwo(sales);
  soldCost = roundToTwo(soldCost);
  expenses = roundToTwo(expenses);

  const grossProfit = roundToTwo(sales - soldCost);
  const netProfit = roundToTwo(grossProfit - expenses);

  const totalStockValue = roundToTwo(
    products.reduce((acc, p) => acc + (p.stock * p.openingRate), 0)
  );

  return {
    purchases,
    sales,
    soldCost,
    grossProfit,
    expenses,
    netProfit,
    totalStockValue,
  };
}

/**
 * Formats a number as Indian Rupee currency.
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

