const test = require('node:test');
const assert = require('node:assert');

// Test suite for Store Calculation & Validation Logic
function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function validatePositive(value, fieldName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${fieldName} must be a number greater than 0.`);
  }
}

function calculateTotal(quantity, rate) {
  validatePositive(quantity, 'Quantity');
  validatePositive(rate, 'Rate');
  return roundToTwo(quantity * rate);
}

function validateSaleStock(availableStock, quantityToSell) {
  validatePositive(quantityToSell, 'Sale quantity');
  if (quantityToSell > availableStock) {
    throw new Error(`Insufficient stock! Available: ${availableStock}, requested: ${quantityToSell}.`);
  }
}

function computeStockOnPurchase(currentStock, purchaseQty) {
  validatePositive(purchaseQty, 'Purchase quantity');
  return roundToTwo(currentStock + purchaseQty);
}

function computeStockOnSale(currentStock, saleQty) {
  validateSaleStock(currentStock, saleQty);
  return roundToTwo(currentStock - saleQty);
}

function computeLedgerSummary(transactions, products, filterDate) {
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

test('Calculation: calculates purchase and sale totals correctly with 2 decimal precision', () => {
  assert.strictEqual(calculateTotal(30, 65), 1950);
  assert.strictEqual(calculateTotal(20, 50), 1000);
  assert.strictEqual(calculateTotal(0.1, 0.2), 0.02);
});

test('Validation: rejects non-positive or non-numeric values', () => {
  assert.throws(() => calculateTotal(0, 50), /Quantity must be a number greater than 0/);
  assert.throws(() => calculateTotal(-5, 50), /Quantity must be a number greater than 0/);
  assert.throws(() => calculateTotal(10, -5), /Rate must be a number greater than 0/);
  assert.throws(() => calculateTotal(10, NaN), /Rate must be a number greater than 0/);
});

test('Inventory: enforces stock availability constraint on sales', () => {
  // Available stock 100, selling 100 should succeed
  assert.doesNotThrow(() => validateSaleStock(100, 100));

  // Available stock 100, selling 30 should succeed
  assert.doesNotThrow(() => validateSaleStock(100, 30));

  // Available stock 100, selling 120 should be rejected
  assert.throws(() => validateSaleStock(100, 120), /Insufficient stock! Available: 100, requested: 120/);
});

test('Inventory: increases stock on purchase and decreases on sale', () => {
  assert.strictEqual(computeStockOnPurchase(0, 100), 100);
  assert.strictEqual(computeStockOnPurchase(100, 50), 150);
  assert.strictEqual(computeStockOnSale(100, 30), 70);
});

test('Ledger: reproduces official assessment Rice/Sugar scenario with 100% accuracy', () => {
  const products = [
    { id: '1', name: 'Rice', unit: 'Kg', openingStock: 0, openingRate: 50, stock: 70 },
    { id: '2', name: 'Sugar', unit: 'Kg', openingStock: 0, openingRate: 40, stock: 30 },
  ];

  const transactions = [
    // Purchases: 100 Kg Rice @ ₹50 (₹5000), 50 Kg Sugar @ ₹40 (₹2000)
    { id: 'p1', type: 'purchase', date: '2026-11-05', total: 5000, quantity: 100, rate: 50, productId: '1', productName: 'Rice' },
    { id: 'p2', type: 'purchase', date: '2026-11-05', total: 2000, quantity: 50, rate: 40, productId: '2', productName: 'Sugar' },
    // Sales: 30 Kg Rice @ ₹65 (₹1950, cost 30*50=1500), 20 Kg Sugar @ ₹50 (₹1000, cost 20*40=800)
    { id: 's1', type: 'sale', date: '2026-11-05', total: 1950, quantity: 30, rate: 65, costRate: 50, productId: '1', productName: 'Rice' },
    { id: 's2', type: 'sale', date: '2026-11-05', total: 1000, quantity: 20, rate: 50, costRate: 40, productId: '2', productName: 'Sugar' },
    // Expenses: Transportation ₹200, Electricity ₹150, Miscellaneous ₹100
    { id: 'e1', type: 'expense', date: '2026-11-05', total: 200, category: 'Transportation' },
    { id: 'e2', type: 'expense', date: '2026-11-05', total: 150, category: 'Electricity' },
    { id: 'e3', type: 'expense', date: '2026-11-05', total: 100, category: 'Miscellaneous' },
  ];

  const summary = computeLedgerSummary(transactions, products);

  assert.strictEqual(summary.purchases, 7000, 'Total purchases should be ₹7,000');
  assert.strictEqual(summary.sales, 2950, 'Total sales should be ₹2,950');
  assert.strictEqual(summary.soldCost, 2300, 'Estimated COGS should be ₹2,300');
  assert.strictEqual(summary.grossProfit, 650, 'Gross profit should be ₹650');
  assert.strictEqual(summary.expenses, 450, 'Total expenses should be ₹450');
  assert.strictEqual(summary.netProfit, 200, 'Net profit should be ₹200');
  assert.strictEqual(summary.totalStockValue, 4700, 'Current stock value should be 70*50 + 30*40 = ₹4,700');
});

