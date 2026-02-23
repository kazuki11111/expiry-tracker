import { useState, useEffect } from 'react';
import type { Product, Category } from '../types';
import { CATEGORY_LABELS } from '../types';
import { estimateExpiryDate } from '../services/expiry';

interface Props {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function ProductForm({ initialData, onSubmit, onCancel, submitLabel = '保存' }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(initialData?.name ?? '');
  const [category, setCategory] = useState<Category>(initialData?.category ?? 'other');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate ?? today);
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate ?? estimateExpiryDate('other', today));
  const [isExpiryEstimated, setIsExpiryEstimated] = useState(initialData?.isExpiryEstimated ?? true);
  const [quantity, setQuantity] = useState(initialData?.quantity ?? 1);

  useEffect(() => {
    if (isExpiryEstimated) {
      setExpiryDate(estimateExpiryDate(category, purchaseDate));
    }
  }, [category, purchaseDate, isExpiryEstimated]);

  const handleExpiryDateChange = (value: string) => {
    setExpiryDate(value);
    setIsExpiryEstimated(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      purchaseDate,
      expiryDate,
      isExpiryEstimated,
      quantity,
      consumed: initialData?.consumed ?? false,
      receiptId: initialData?.receiptId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">商品名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="例: 牛乳"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category);
            setIsExpiryEstimated(true);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">購入日</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          賞味期限
          {isExpiryEstimated && (
            <span className="ml-2 text-xs text-blue-500">（自動推定）</span>
          )}
        </label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => handleExpiryDateChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">数量</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-1 block w-24 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
