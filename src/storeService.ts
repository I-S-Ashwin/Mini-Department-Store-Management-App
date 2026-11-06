import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, StoreTransaction, Unit, ExpenseCategory } from './types';
import { calculateTotal, validateSaleStock, roundToTwo } from './calculations';

/**
 * Real-time listener for the user's products.
 */
export function subscribeProducts(
  userId: string,
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  const productsRef = collection(db, 'users', userId, 'products');
  const q = query(productsRef, orderBy('name', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Product[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, 'id'>),
      }));
      onUpdate(items);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

/**
 * Adds a new product to the Product Master.
 */
export async function addProduct(
  userId: string,
  data: {
    name: string;
    unit: Unit;
    openingStock: number;
    openingRate: number;
  }
): Promise<string> {
  const productsRef = collection(db, 'users', userId, 'products');
  const docRef = await addDoc(productsRef, {
    name: data.name.trim(),
    unit: data.unit,
    openingStock: roundToTwo(data.openingStock),
    openingRate: roundToTwo(data.openingRate),
    stock: roundToTwo(data.openingStock),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return docRef.id;
}

/**
 * Updates an existing product's details.
 */
export async function updateProduct(
  userId: string,
  productId: string,
  data: {
    name: string;
    unit: Unit;
    openingRate: number;
    openingStock: number;
    stockDelta?: number; // adjustment if opening stock changed
  }
): Promise<void> {
  const productRef = doc(db, 'users', userId, 'products', productId);
  const updates: Record<string, any> = {
    name: data.name.trim(),
    unit: data.unit,
    openingRate: roundToTwo(data.openingRate),
    openingStock: roundToTwo(data.openingStock),
    updatedAt: Date.now(),
  };

  if (typeof data.stockDelta === 'number' && data.stockDelta !== 0) {
    await runTransaction(db, async (txn) => {
      const snap = await txn.get(productRef);
      if (!snap.exists()) throw new Error('Product not found.');
      const current = snap.data() as Product;
      const newStock = roundToTwo(current.stock + data.stockDelta!);
      txn.update(productRef, { ...updates, stock: Math.max(0, newStock) });
    });
    return;
  }

  await updateDoc(productRef, updates);
}

/**
 * Seeds the sample products defined in assessment requirements:
 * Rice (Kg), Sugar (Kg), Cooking Oil (Litre), Biscuits (Nos).
 */
export async function seedSampleProducts(userId: string): Promise<void> {
  const samples = [
    { name: 'Rice', unit: 'Kg' as Unit, openingStock: 0, openingRate: 50 },
    { name: 'Sugar', unit: 'Kg' as Unit, openingStock: 0, openingRate: 40 },
    { name: 'Cooking Oil', unit: 'Litre' as Unit, openingStock: 0, openingRate: 130 },
    { name: 'Biscuits', unit: 'Nos' as Unit, openingStock: 0, openingRate: 20 },
  ];

  for (const item of samples) {
    await addProduct(userId, item);
  }
}

/**
 * Records a purchase entry and atomically increments the product stock.
 */
export async function recordPurchase(
  userId: string,
  purchase: {
    date: string;
    supplierName: string;
    productId: string;
    productName: string;
    unit: Unit;
    quantity: number;
    rate: number;
  }
): Promise<void> {
  const total = calculateTotal(purchase.quantity, purchase.rate);
  const productRef = doc(db, 'users', userId, 'products', purchase.productId);
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const newTxDoc = doc(transactionsRef);

  await runTransaction(db, async (txn) => {
    const prodSnap = await txn.get(productRef);
    if (!prodSnap.exists()) {
      throw new Error('Selected product does not exist.');
    }
    const currentProd = prodSnap.data() as Product;
    const newStock = roundToTwo(currentProd.stock + purchase.quantity);

    txn.update(productRef, {
      stock: newStock,
      updatedAt: Date.now(),
    });

    txn.set(newTxDoc, {
      type: 'purchase',
      date: purchase.date,
      supplierName: purchase.supplierName.trim(),
      productId: purchase.productId,
      productName: purchase.productName,
      unit: purchase.unit,
      quantity: roundToTwo(purchase.quantity),
      rate: roundToTwo(purchase.rate),
      total,
      createdAt: Date.now(),
    });
  });
}

/**
 * Records a sales entry and atomically decrements product stock.
 * REJECTS sales exceeding available stock.
 */
export async function recordSale(
  userId: string,
  sale: {
    date: string;
    productId: string;
    productName: string;
    unit: Unit;
    quantity: number;
    rate: number;
  }
): Promise<void> {
  const total = calculateTotal(sale.quantity, sale.rate);
  const productRef = doc(db, 'users', userId, 'products', sale.productId);
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const newTxDoc = doc(transactionsRef);

  await runTransaction(db, async (txn) => {
    const prodSnap = await txn.get(productRef);
    if (!prodSnap.exists()) {
      throw new Error('Selected product does not exist.');
    }
    const currentProd = prodSnap.data() as Product;

    // Validate that available stock is sufficient
    validateSaleStock(currentProd.stock, sale.quantity);

    const newStock = roundToTwo(currentProd.stock - sale.quantity);

    txn.update(productRef, {
      stock: newStock,
      updatedAt: Date.now(),
    });

    txn.set(newTxDoc, {
      type: 'sale',
      date: sale.date,
      productId: sale.productId,
      productName: sale.productName,
      unit: sale.unit,
      quantity: roundToTwo(sale.quantity),
      rate: roundToTwo(sale.rate),
      costRate: currentProd.openingRate || 0,
      total,
      createdAt: Date.now(),
    });
  });
}

/**
 * Records an expense entry.
 */
export async function recordExpense(
  userId: string,
  expense: {
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
  }
): Promise<void> {
  if (!Number.isFinite(expense.amount) || expense.amount <= 0) {
    throw new Error('Expense amount must be greater than 0.');
  }

  const transactionsRef = collection(db, 'users', userId, 'transactions');
  await addDoc(transactionsRef, {
    type: 'expense',
    date: expense.date,
    category: expense.category,
    description: expense.description.trim(),
    total: roundToTwo(expense.amount),
    createdAt: Date.now(),
  });
}

/**
 * Real-time listener for user transactions (Sales, Purchases, Expenses).
 */
export function subscribeTransactions(
  userId: string,
  onUpdate: (transactions: StoreTransaction[]) => void,
  onError?: (error: Error) => void
) {
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: StoreTransaction[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<StoreTransaction, 'id'>),
      }));
      onUpdate(items);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

