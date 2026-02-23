export interface Product {
  id?: number;
  name: string;
  category: Category;
  purchaseDate: string;
  expiryDate: string;
  isExpiryEstimated: boolean;
  quantity: number;
  consumed: boolean;
  receiptId?: number;
  createdAt: string;
}

export interface Receipt {
  id?: number;
  imageBlob: Blob;
  scannedAt: string;
  storeName?: string;
}

export interface Settings {
  id: number;
  notifyDaysBefore: number[];
  notifyTime: string;
  enabled: boolean;
}

export type Category =
  | 'dairy'
  | 'meat'
  | 'fish'
  | 'vegetable'
  | 'fruit'
  | 'bread'
  | 'frozen'
  | 'canned'
  | 'snack'
  | 'beverage'
  | 'seasoning'
  | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  dairy: '乳製品',
  meat: '肉類',
  fish: '魚介類',
  vegetable: '野菜',
  fruit: '果物',
  bread: 'パン',
  frozen: '冷凍食品',
  canned: '缶詰',
  snack: '菓子',
  beverage: '飲料',
  seasoning: '調味料',
  other: 'その他',
};

export interface OcrResult {
  products: Array<{
    name: string;
    category: Category;
    quantity: number;
  }>;
  storeName?: string;
}
