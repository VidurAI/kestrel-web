export function formatEta(eta: string | null, locale: string = 'en-GB'): string {
  if (eta === null || eta === '') return 'TBC';
  const date = new Date(eta);
  if (Number.isNaN(date.getTime())) return 'TBC';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatRoute(origin: string, destination: string): string {
  return `${origin} → ${destination}`;
}

export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatWeight(kg: number): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(kg)} kg`;
}
