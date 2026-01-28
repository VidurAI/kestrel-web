export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatMoney(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'en-US',
): string {
  const rounded = roundMoney(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rounded);
  } catch {
    return `${rounded.toFixed(2)} ${currency}`;
  }
}

export function sumMoney(values: readonly number[]): number {
  return roundMoney(values.reduce((total, v) => total + v, 0));
}

export function parseMoneyInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, '');
  if (cleaned === '' || !/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return roundMoney(Number(cleaned));
}
