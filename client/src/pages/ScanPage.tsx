import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../components/CameraCapture';
import { scanReceipt } from '../services/ocr';
import type { OcrResult } from '../types';

export function ScanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCapture = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result: OcrResult = await scanReceipt(file);
      navigate('/scan/result', { state: { ocrResult: result } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-800">レシートをスキャン</h2>
      <p className="mb-4 text-sm text-gray-500">
        レシートを撮影またはアップロードすると、商品を自動で読み取ります。
      </p>

      <CameraCapture onCapture={handleCapture} isLoading={isLoading} />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
