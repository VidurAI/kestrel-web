import type { ReactElement } from 'react';
import { formatMoney } from '../lib/money';

interface MoneyTextProps {
  amount: number;
  currency?: string;
  strong?: boolean;
}

export function MoneyText({ amount, currency = 'EUR', strong = false }: MoneyTextProps): ReactElement {
  const text = formatMoney(amount, currency);
  const className = amount < 0 ? 'money money--negative' : 'money';
  return strong ? (
    <strong className={className}>{text}</strong>
  ) : (
    <span className={className}>{text}</span>
  );
}
