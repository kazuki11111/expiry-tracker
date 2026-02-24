import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Memo } from '../types';

export function MemoPage() {
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [content, setContent] = useState('');

  const memos = useLiveQuery(async () => {
    const all = await db.memos.toArray();
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });

  const handleAdd = async () => {
    const now = new Date().toISOString();
    await db.memos.add({ content: '', createdAt: now, updatedAt: now });
  };

  const handleSave = async () => {
    if (!editingMemo?.id) return;
    await db.memos.update(editingMemo.id, {
      content,
      updatedAt: new Date().toISOString(),
    });
    setEditingMemo(null);
    setContent('');
  };

  const handleDelete = async (id: number) => {
    if (confirm('このメモを削除しますか？')) {
      await db.memos.delete(id);
      if (editingMemo?.id === id) {
        setEditingMemo(null);
        setContent('');
      }
    }
  };

  const startEdit = (memo: Memo) => {
    setEditingMemo(memo);
    setContent(memo.content);
  };

  if (editingMemo) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">メモを編集</h2>
          <button
            onClick={() => { setEditingMemo(null); setContent(''); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            戻る
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4 block w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={10}
          placeholder="メモを入力..."
          autoFocus
        />
        <button
          onClick={handleSave}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
        >
          保存
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          メモ
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({memos?.length ?? 0}件)
          </span>
        </h2>
        <button
          onClick={handleAdd}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
        >
          新規作成
        </button>
      </div>

      {(!memos || memos.length === 0) ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-4xl">📝</p>
          <p className="mt-2">メモがありません</p>
          <p className="text-sm">「新規作成」からメモを追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => startEdit(memo)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm text-gray-800 line-clamp-3 whitespace-pre-wrap">
                    {memo.content || '（空のメモ）'}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(memo.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </button>
                <button
                  onClick={() => handleDelete(memo.id!)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-gray-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                  title="削除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
