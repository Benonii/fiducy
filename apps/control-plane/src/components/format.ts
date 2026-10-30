const MINUTE_MILLISECONDS = 60_000;
const HOUR_MILLISECONDS = 60 * MINUTE_MILLISECONDS;
const DAY_MILLISECONDS = 24 * HOUR_MILLISECONDS;

const numberFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});
const dayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC'
});
const monthFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatCompact(value: number): string {
  return value < 10_000 ? numberFormat.format(value) : compactFormat.format(value);
}

export function formatDay(isoDate: string): string {
  return dayFormat.format(new Date(isoDate));
}

export function formatMonth(month: string): string {
  return monthFormat.format(new Date(`${month}-01T00:00:00Z`));
}

export function formatRelativeTime(isoDate: string, now = Date.now()): string {
  const elapsed = Math.max(0, now - new Date(isoDate).getTime());
  if (elapsed < MINUTE_MILLISECONDS) return 'just now';
  if (elapsed < HOUR_MILLISECONDS) return `${Math.floor(elapsed / MINUTE_MILLISECONDS)} min ago`;
  if (elapsed < DAY_MILLISECONDS) return `${Math.floor(elapsed / HOUR_MILLISECONDS)} h ago`;
  return formatDay(isoDate);
}

export function shortenIdentifier(identifier: string, visible = 10): string {
  if (identifier.length <= visible + 2) return identifier;
  return `${identifier.slice(0, visible)}...${identifier.slice(-4)}`;
}
