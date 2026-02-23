import { getDaysUntilExpiry, getExpiryStatus } from '../services/expiry';

interface Props {
  expiryDate: string;
}

export function ExpiryBadge({ expiryDate }: Props) {
  const days = getDaysUntilExpiry(expiryDate);
  const status = getExpiryStatus(expiryDate);

  const styles = {
    expired: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    ok: 'bg-green-100 text-green-800',
  };

  const label =
    days < 0
      ? `${Math.abs(days)}日超過`
      : days === 0
        ? '今日まで'
        : `あと${days}日`;

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {label}
    </span>
  );
}
