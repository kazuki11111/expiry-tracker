import type { OcrResult } from '../types';

export async function scanReceipt(file: File): Promise<OcrResult> {
  const base64 = await fileToBase64(file);
  const mediaType = file.type || 'image/jpeg';

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${apiUrl}/api/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, mediaType }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'OCR処理に失敗しました');
  }

  return response.json();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
