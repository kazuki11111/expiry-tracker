import type { Category } from '../types';

const EXPIRY_DAYS: Record<Category, number> = {
  dairy: 7,
  meat: 3,
  fish: 2,
  vegetable: 7,
  fruit: 5,
  bread: 4,
  frozen: 90,
  canned: 365,
  snack: 90,
  beverage: 180,
  seasoning: 365,
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
