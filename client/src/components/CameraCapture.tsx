import { useRef } from 'react';

interface Props {
  onCapture: (file: File) => void;
  isLoading?: boolean;
}

export function CameraCapture({ onCapture, isLoading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <button
        onClick={() => cameraInputRef.current?.click()}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-8 text-blue-600 hover:border-blue-400 hover:bg-blue-100 disabled:opacity-50"
      >
        <span className="text-3xl">📷</span>
        <span className="font-medium">カメラで撮影</span>
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 text-gray-600 hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50"
      >
        <span className="text-2xl">📁</span>
        <span className="font-medium">画像を選択</span>
      </button>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-blue-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>レシートを解析中...</span>
        </div>
      )}
    </div>
  );
}
