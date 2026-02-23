import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Product } from '../types';

export function useProducts(includeConsumed = false) {
  const products = useLiveQuery(async () => {
    const all = await db.products.toArray();
    const filtered = includeConsumed ? all : all.filter((p) => !p.consumed);
    // Sort by purchaseDate (oldest first), then expiryDate (soonest first)
    return filtered.sort((a, b) => {
      const dateCmp = a.purchaseDate.localeCompare(b.purchaseDate);
      if (dateCmp !== 0) return dateCmp;
      return a.expiryDate.localeCompare(b.expiryDate);
    });
  }, [includeConsumed]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    return db.products.add({
      ...product,
      createdAt: new Date().toISOString(),
    });
  };

  const updateProduct = async (id: number, changes: Partial<Product>) => {
    return db.products.update(id, changes);
  };

  const deleteProduct = async (id: number) => {
    return db.products.delete(id);
  };

  const toggleConsumed = async (id: number) => {
    const product = await db.products.get(id);
    if (product) {
      return db.products.update(id, { consumed: !product.consumed });
    }
  };

  const deleteByPurchaseDate = async (purchaseDate: string) => {
    const targets = await db.products.filter((p) => p.purchaseDate === purchaseDate).toArray();
    const ids = targets.map((p) => p.id!);
    return db.products.bulkDelete(ids);
  };

  const addProducts = async (products: Omit<Product, 'id' | 'createdAt'>[]) => {
    const now = new Date().toISOString();
    return db.products.bulkAdd(
      products.map((p) => ({ ...p, createdAt: now }))
    );
  };

  return {
    products: products ?? [],
    addProduct,
    addProducts,
    updateProduct,
    deleteProduct,
    deleteByPurchaseDate,
    toggleConsumed,
  };
}
