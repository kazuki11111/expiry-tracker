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
  | 'meat_ground'
  | 'fish'
  | 'egg'
  | 'tofu'
  | 'natto'
  | 'ham_sausage'
  | 'vegetable_leaf'
  | 'vegetable_root'
  | 'vegetable_other'
  | 'fruit'
  | 'bread'
  | 'rice'
  | 'dry_noodle'
  | 'instant'
  | 'flour'
  | 'frozen'
  | 'frozen_vegetable'
  | 'canned'
  | 'retort'
  | 'snack'
  | 'beverage'
  | 'seasoning'
  | 'sugar_salt'
  | 'oil_vinegar'
  | 'deli'
  | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  dairy: '乳製品',
  meat: '肉類',
  meat_ground: 'ひき肉',
  fish: '魚介類',
  egg: '卵',
  tofu: '豆腐',
  natto: '納豆',
  ham_sausage: 'ハム・ソーセージ',
  vegetable_leaf: '葉物野菜',
  vegetable_root: '根菜・いも類',
  vegetable_other: 'その他の野菜',
  fruit: '果物',
  bread: 'パン',
  rice: '米',
  dry_noodle: '乾麺',
  instant: 'インスタント食品',
  flour: '小麦粉',
  frozen: '冷凍食品',
  frozen_vegetable: '冷凍野菜',
  canned: '缶詰',
  retort: 'レトルト',
  snack: '菓子',
  beverage: '飲料',
  seasoning: '調味料',
  sugar_salt: '砂糖・塩',
  oil_vinegar: '油・酢',
  deli: '惣菜',
  other: 'その他',
};

export interface Memo {
  id?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface OcrResult {
  products: Array<{
    name: string;
    category: Category;
    quantity: number;
  }>;
  storeName?: string;
}
