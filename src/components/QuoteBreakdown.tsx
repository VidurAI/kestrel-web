import type { ReactElement } from 'react';
import type { Quote } from '../api/types';
import { MoneyText } from './MoneyText';

export function QuoteBreakdown({ quote }: { quote: Quote }): ReactElement {
  return (
    <table className="table table--compact" aria-label="Quote breakdown">
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col" className="num">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {quote.breakdown.map((line, i) => (
          <tr key={`${line.label}-${i}`}>
            <td>{line.label}</td>
            <td className="num">
              <MoneyText amount={line.amount} currency={quote.currency} />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          <td className="num">
            <MoneyText amount={quote.amount} currency={quote.currency} strong />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
