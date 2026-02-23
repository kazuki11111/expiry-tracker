import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductForm } from '../components/ProductForm';
import type { Product } from '../types';

export function HomePage() {
  const [showConsumed, setShowConsumed] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { products, toggleConsumed, deleteProduct, updateProduct } = useProducts(showConsumed);

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
      <div className="mb-4 flex items-center justify-between">
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

      {products.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-4xl">🛒</p>
          <p className="mt-2">商品がありません</p>
          <p className="text-sm">レシートをスキャンするか、手動で追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
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
}
