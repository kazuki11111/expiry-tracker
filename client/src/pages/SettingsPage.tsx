import { useState, useEffect } from 'react';
import { db, getSettings } from '../db';
import type { Settings } from '../types';
import { requestNotificationPermission } from '../services/notification';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    getSettings().then(setSettings);
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  const save = async (changes: Partial<Settings>) => {
    if (!settings) return;
    const updated = { ...settings, ...changes };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const toggleDay = (day: number) => {
    if (!settings) return;
    const days = settings.notifyDaysBefore.includes(day)
      ? settings.notifyDaysBefore.filter((d) => d !== day)
      : [...settings.notifyDaysBefore, day].sort((a, b) => a - b);
    save({ notifyDaysBefore: days });
  };

  if (!settings) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-800">設定</h2>

      <div className="space-y-6">
        {/* 通知ON/OFF */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">通知</h3>
              <p className="text-sm text-gray-500">賞味期限が近い商品を通知</p>
            </div>
            <button
              onClick={() => save({ enabled: !settings.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {permissionStatus === 'unsupported' && (
            <p className="mt-2 text-sm text-red-500">
              このブラウザは通知に対応していません
            </p>
          )}

          {permissionStatus === 'default' && (
            <button
              onClick={handleRequestPermission}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              通知の許可を求める
            </button>
          )}

          {permissionStatus === 'denied' && (
            <p className="mt-2 text-sm text-red-500">
              通知がブロックされています。ブラウザの設定から許可してください。
            </p>
          )}
        </div>

        {/* 通知タイミング */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-medium text-gray-800">通知タイミング（期限の何日前）</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 7].map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`rounded-full px-3 py-1 text-sm ${
                  settings.notifyDaysBefore.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {day}日前
              </button>
            ))}
          </div>
        </div>

        {/* 通知時刻 */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-medium text-gray-800">通知チェック時刻</h3>
          <input
            type="time"
            value={settings.notifyTime}
            onChange={(e) => save({ notifyTime: e.target.value })}
            className="rounded border border-gray-300 px-3 py-1.5"
          />
        </div>

        {/* データ管理 */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-medium text-gray-800">データ管理</h3>
          <button
            onClick={async () => {
              if (confirm('消費済みの商品をすべて削除しますか？')) {
                await db.products.where('consumed').equals(1).delete();
              }
            }}
            className="text-sm text-red-500 hover:underline"
          >
            消費済み商品を一括削除
          </button>
        </div>
      </div>
    </div>
  );
}
