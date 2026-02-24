import Dexie, { type Table } from 'dexie';
import type { Product, Receipt, Settings, Memo } from '../types';

class AppDatabase extends Dexie {
  products!: Table<Product, number>;
  receipts!: Table<Receipt, number>;
  settings!: Table<Settings, number>;
  memos!: Table<Memo, number>;

  constructor() {
    super('ReceiptExpiryApp');
    this.version(1).stores({
      products: '++id, category, expiryDate, consumed, receiptId',
      receipts: '++id, scannedAt',
      settings: 'id',
    });
    this.version(2).stores({
      products: '++id, category, expiryDate, consumed, receiptId',
      receipts: '++id, scannedAt',
      settings: 'id',
      memos: '++id, updatedAt',
    });
  }
}

export const db = new AppDatabase();

export async function getSettings(): Promise<Settings> {
  let settings = await db.settings.get(1);
  if (!settings) {
    settings = {
      id: 1,
      notifyDaysBefore: [1, 3],
      notifyTime: '09:00',
      enabled: true,
    };
    await db.settings.put(settings);
  }
  return settings;
}
