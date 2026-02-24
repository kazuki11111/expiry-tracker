import type { Category } from '../types';

const EXPIRY_DAYS: Record<Category, number> = {
  dairy: 10,            // 牛乳1週間、ヨーグルト2週間、チーズ2週間〜 → 平均10日
  meat: 5,              // 薄切り肉: 3〜5日
  meat_ground: 2,       // ひき肉: 1〜2日
  fish: 3,              // 刺身〜切り身: 2〜3日
  egg: 14,              // 卵: 2〜3週間
  tofu: 3,              // 豆腐: 2〜5日
  natto: 7,             // 納豆: 1週間前後
  ham_sausage: 14,      // ハム/ソーセージ: 未開封2〜4週間 → 平均14日
  vegetable_leaf: 3,    // レタス/ほうれん草: 2〜5日
  vegetable_root: 14,   // にんじん1〜3週間、じゃがいも2〜4週間、玉ねぎ1〜2か月
  vegetable_other: 5,   // きゅうり/なす/トマト: 3〜7日
  fruit: 7,             // りんご2〜4週間、バナナ3〜7日 → 平均7日
  bread: 4,             // 食パン: 3〜5日
  rice: 45,             // 精米: 1〜2か月
  dry_noodle: 730,      // 乾麺: 1〜3年
  instant: 270,         // インスタント麺: 6か月〜1年
  flour: 270,           // 小麦粉: 6か月〜1年
  frozen: 90,           // 冷凍食品(市販): 数か月〜1年
  frozen_vegetable: 300, // 冷凍野菜: 8〜12か月
  canned: 1095,         // 缶詰: 2〜5年
  retort: 545,          // レトルト: 1〜2年
  snack: 180,           // 菓子: 3〜12か月 → 平均6か月
  beverage: 180,        // 飲料: 6か月程度
  seasoning: 365,       // 醤油/みそ: 6か月〜2年
  sugar_salt: 1825,     // 砂糖/塩: かなり長い（5年目安）
  oil_vinegar: 545,     // 食用油/酢: 1〜2年
  deli: 1,              // 惣菜: 当日〜翌日
  other: 14,
};

export function estimateExpiryDate(category: Category, purchaseDate: string): string {
  const days = EXPIRY_DAYS[category];
  const date = new Date(purchaseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: string): 'expired' | 'warning' | 'ok' {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 3) return 'warning';
  return 'ok';
}
