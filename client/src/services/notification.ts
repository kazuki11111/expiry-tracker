import { db, getSettings } from '../db';
import { getDaysUntilExpiry } from './expiry';

export function getNotificationSupport(): 'supported' | 'unsupported' | 'needs-pwa' {
  if ('Notification' in window) {
    return 'supported';
  }
  // iOS Safari etc: notifications only work when installed as PWA
  if ('serviceWorker' in navigator) {
    return 'needs-pwa';
  }
  return 'unsupported';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission === 'denied') {
    return false;
  }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function checkAndNotify(): Promise<void> {
  const settings = await getSettings();
  if (!settings.enabled) return;

  if (Notification.permission !== 'granted') return;

  const products = await db.products
    .filter((p) => !p.consumed)
    .toArray();

  const reg = await navigator.serviceWorker?.getRegistration();

  for (const product of products) {
    const daysLeft = getDaysUntilExpiry(product.expiryDate);

    const notify = (body: string, tag: string) => {
      const options = { body, icon: '/icons/icon-192.png', tag };
      if (reg) {
        reg.showNotification('もったいないアラーム', options);
      } else {
        new Notification('もったいないアラーム', options);
      }
    };

    for (const threshold of settings.notifyDaysBefore) {
      if (daysLeft === threshold) {
        notify(
          `${product.name} の賞味期限が${threshold}日後です`,
          `expiry-${product.id}-${threshold}`,
        );
      }
    }

    if (daysLeft === 0) {
      notify(
        `${product.name} の賞味期限は今日です！`,
        `expiry-${product.id}-today`,
      );
    }

    if (daysLeft < 0) {
      notify(
        `${product.name} の賞味期限が${Math.abs(daysLeft)}日過ぎています`,
        `expiry-${product.id}-expired`,
      );
    }
  }
}

let checkInterval: ReturnType<typeof setInterval> | null = null;

export function startNotificationScheduler(): void {
  if (checkInterval) return;

  // 初回チェック
  checkAndNotify();

  // 1時間ごとにチェック
  checkInterval = setInterval(checkAndNotify, 60 * 60 * 1000);
}

export function stopNotificationScheduler(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
