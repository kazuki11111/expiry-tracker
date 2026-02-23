import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/ProductForm';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types';

export function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    await addProduct(data);
    navigate('/');
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-800">商品を追加</h2>
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
        submitLabel="追加"
      />
    </div>
  );
}
