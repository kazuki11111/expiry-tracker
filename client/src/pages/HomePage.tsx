import { useState, useMemo, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductForm } from '../components/ProductForm';
import type { Product } from '../types';
import { CATEGORY_LABELS } from '../types';

type GroupMode = 'date' | 'category';

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

export function HomePage() {
  const [showConsumed, setShowConsumed] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { products, toggleConsumed, deleteProduct, deleteByPurchaseDate, updateProduct } = useProducts(showConsumed);
  const [groupMode, setGroupMode] = useState<GroupMode>('date');
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const groupedByDate = useMemo(() => {
    const groups: { key: string; label: string; items: Product[] }[] = [];
    for (const product of products) {
      const last = groups[groups.length - 1];
      if (last && last.key === product.purchaseDate) {
        last.items.push(product);
      } else {
        groups.push({
          key: product.purchaseDate,
          label: `${formatDateHeader(product.purchaseDate)} 購入`,
          items: [product],
        });
      }
    }
    return groups;
  }, [products]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const existing = map.get(product.category);
      if (existing) {
        existing.push(product);
      } else {
        map.set(product.category, [product]);
      }
    }
    return Array.from(map.entries()).map(([cat, items]) => ({
      key: `cat-${cat}`,
      label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat,
      items,
    }));
  }, [products]);

  const groups = groupMode === 'date' ? groupedByDate : groupedByCategory;

  const handleDelete = (id: number) => {
    if (confirm('この商品を削除しますか？')) {
      deleteProduct(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct?.id) {
      await updateProduct(editingProduct.id, data);
      setEditingProduct(null);
    }
  };

  if (editingProduct) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-800">商品を編集</h2>
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleUpdate}
          onCancel={() => setEditingProduct(null)}
          submitLabel="更新"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          商品一覧
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({products.length}件)
          </span>
        </h2>
        <label className="flex items-center gap-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showConsumed}
            onChange={(e) => setShowConsumed(e.target.checked)}
            className="rounded"
          />
          消費済みも表示
        </label>
      </div>

      <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => { setGroupMode('date'); setCollapsedKeys(new Set()); }}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            groupMode === 'date' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          日付順
        </button>
        <button
          onClick={() => { setGroupMode('category'); setCollapsedKeys(new Set()); }}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            groupMode === 'category' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          カテゴリ順
        </button>
      </div>

      {products.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-4xl">🛒</p>
          <p className="mt-2">商品がありません</p>
          <p className="text-sm">レシートをスキャンするか、手動で追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isCollapsed = collapsedKeys.has(group.key);
            return (
              <div key={group.key}>
                <div className="mb-2 flex items-center gap-1">
                  <button
                    onClick={() => toggleCollapse(group.key)}
                    className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 active:bg-gray-200"
                  >
                    <span className={`text-xs text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>
                      ▶
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {group.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {group.items.length}件
                    </span>
                  </button>
                  {groupMode === 'date' && (
                    <button
                      onClick={() => {
                        if (confirm(`${group.label}の${group.items.length}件の商品をすべて削除しますか？`)) {
                          deleteByPurchaseDate(group.key);
                        }
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-gray-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                      title="この日の商品をすべて削除"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="space-y-3">
                    {group.items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onToggleConsumed={toggleConsumed}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
