import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Product, Category, OcrResult } from '../types';
import { CATEGORY_LABELS } from '../types';
import { estimateExpiryDate } from '../services/expiry';
import { useProducts } from '../hooks/useProducts';

interface EditableProduct {
  name: string;
  category: Category;
  quantity: number;
  expiryDate: string;
  isExpiryEstimated: boolean;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function ScanResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addProducts } = useProducts();
  const ocrResult = location.state?.ocrResult as OcrResult | undefined;

  const today = new Date().toISOString().split('T')[0];

  const [items, setItems] = useState<EditableProduct[]>(() => {
    if (!ocrResult?.products) return [];
    return ocrResult.products.map((p) => ({
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      expiryDate: estimateExpiryDate(p.category, today),
      isExpiryEstimated: true,
    }));
  });

  const [purchaseDate, setPurchaseDate] = useState(today);
  const [storeName] = useState(ocrResult?.storeName ?? '');

  if (!ocrResult) {
    navigate('/scan');
    return null;
  }

  const updateItem = (index: number, changes: Partial<EditableProduct>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...changes };
        // カテゴリが変更されたら期限を再推定
        if (changes.category && !('expiryDate' in changes)) {
          updated.expiryDate = estimateExpiryDate(changes.category, purchaseDate);
          updated.isExpiryEstimated = true;
        }
        if (changes.expiryDate) {
          updated.isExpiryEstimated = false;
        }
        return updated;
      })
    );
  };

  const handlePurchaseDateChange = (newDate: string) => {
    setPurchaseDate(newDate);
    // 推定期限を新しい購入日で再計算
    setItems((prev) =>
      prev.map((item) => {
        if (!item.isExpiryEstimated) return item;
        return { ...item, expiryDate: estimateExpiryDate(item.category, newDate) };
      })
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const products: Omit<Product, 'id' | 'createdAt'>[] = items.map((item) => ({
      name: item.name,
      category: item.category,
      purchaseDate,
      expiryDate: item.expiryDate,
      isExpiryEstimated: item.isExpiryEstimated,
      quantity: item.quantity,
      consumed: false,
    }));
    await addProducts(products);
    navigate('/');
  };

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-gray-800">読み取り結果</h2>
      {storeName && (
        <p className="mb-4 text-sm text-gray-500">店舗: {storeName}</p>
      )}
      <div className="mb-4 rounded-lg border bg-white p-3 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-gray-700">購入日</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => handlePurchaseDateChange(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <p className="mb-4 text-sm text-gray-500">
        内容を確認・修正して保存してください（{items.length}件）
      </p>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              <button
                onClick={() => removeItem(index)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                className="block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                placeholder="商品名"
              />

              <div className="flex gap-2">
                <select
                  value={item.category}
                  onChange={(e) => updateItem(index, { category: e.target.value as Category })}
                  className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={item.expiryDate}
                  onChange={(e) => updateItem(index, { expiryDate: e.target.value })}
                  className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
                {item.isExpiryEstimated && (
                  <span className="text-xs text-blue-500">推定</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700"
          >
            {items.length}件を保存
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            戻る
          </button>
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-400">
          <p>商品がありません</p>
          <button
            onClick={() => navigate('/scan')}
            className="mt-2 text-blue-600 hover:underline"
          >
            再スキャン
          </button>
        </div>
      )}
    </div>
  );
}
