import type { Product } from '../types';
import { CATEGORY_LABELS } from '../types';
import { ExpiryBadge } from './ExpiryBadge';

interface Props {
  product: Product;
  onToggleConsumed: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
}

export function ProductCard({ product, onToggleConsumed, onDelete, onEdit }: Props) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${product.consumed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${product.consumed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {product.name}
            </h3>
            {!product.consumed && <ExpiryBadge expiryDate={product.expiryDate} />}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span>{CATEGORY_LABELS[product.category]}</span>
            <span>×{product.quantity}</span>
            {product.isExpiryEstimated && (
              <span className="text-xs text-blue-500">期限推定</span>
            )}
          </div>
          <div className="mt-1 flex gap-3 text-xs text-gray-400">
            <span>購入: {product.purchaseDate}</span>
            <span>期限: {product.expiryDate}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleConsumed(product.id!)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200"
            title={product.consumed ? '未消費に戻す' : '消費済みにする'}
          >
            {product.consumed ? '↩' : '✓'}
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 active:bg-blue-50"
            title="編集"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(product.id!)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-gray-400 hover:bg-gray-100 hover:text-red-600 active:bg-red-50"
            title="削除"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
