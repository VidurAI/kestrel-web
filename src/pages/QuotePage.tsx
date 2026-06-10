import { useState, type FormEvent, type ReactElement } from 'react';
import { describeError } from '../api/errors';
import { CarrierSelect } from '../components/CarrierSelect';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MoneyText } from '../components/MoneyText';
import { QuoteBreakdown } from '../components/QuoteBreakdown';
import { useCarriers } from '../hooks/useCarriers';
import { useQuote, type CarrierQuote } from '../hooks/useQuote';
import { QUOTE_ERROR_COPY } from '../lib/copy';
import { isMultiCarrierQuotesEnabled } from '../lib/flags';
import { formatWeight } from '../lib/format';
import {
  hasErrors,
  normaliseLocode,
  validateQuote,
  type FieldErrors,
  type QuoteField,
  type QuoteFormValues,
} from '../lib/validation';

const EMPTY: QuoteFormValues = { origin: '', destination: '', weightKg: '', carrierCode: '' };

function cheapestCode(results: readonly CarrierQuote[]): string | null {
  let best: CarrierQuote | null = null;
  for (const r of results) {
    if (r.quote && (best === null || r.quote.amount < (best.quote?.amount ?? Infinity))) best = r;
  }
  return best?.carrierCode ?? null;
}

function QuoteCard({ result, highlight }: { result: CarrierQuote; highlight: boolean }): ReactElement {
  return (
    <section className={highlight ? 'card card--highlight' : 'card'} aria-label={`Quote from ${result.carrierCode}`}>
      <h3>
        {result.carrierCode}
        {highlight ? <span className="tag">Best price</span> : null}
      </h3>
      {result.quote ? (
        <>
          <p className="quote__total">
            <MoneyText amount={result.quote.amount} currency={result.quote.currency} strong />
          </p>
          <QuoteBreakdown quote={result.quote} />
        </>
      ) : (
        <ErrorBanner message={QUOTE_ERROR_COPY} detail={describeError(result.error)} />
      )}
    </section>
  );
}

export function QuotePage(): ReactElement {
  const multi = isMultiCarrierQuotesEnabled();
  const { activeCarriers, status: carriersStatus, error: carriersError, reload } = useCarriers();
  const { results, status, error, fetchQuote, fetchQuotes, reset } = useQuote();
  const [values, setValues] = useState<QuoteFormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<QuoteField>>({});
  const [submitted, setSubmitted] = useState<{ weightKg: number } | null>(null);

  const update = (field: QuoteField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const found = validateQuote(values, { carrierRequired: !multi });
    setErrors(found);
    if (hasErrors(found)) return;

    const base = {
      origin: normaliseLocode(values.origin),
      destination: normaliseLocode(values.destination),
      weightKg: Number(values.weightKg),
    };
    setSubmitted({ weightKg: base.weightKg });
    if (multi && values.carrierCode === '') {
      await fetchQuotes(base, activeCarriers.map((c) => c.code));
    } else {
      await fetchQuote({ ...base, carrierCode: values.carrierCode });
    }
  };

  if (carriersStatus === 'loading') return <LoadingSpinner label="Loading carriers" />;
  if (carriersStatus === 'error') {
    return <ErrorBanner message="We couldn't load carriers" detail={describeError(carriersError)} onRetry={reload} />;
  }

  const loading = status === 'loading';
  const best = multi ? cheapestCode(results) : null;

  return (
    <div>
      <form onSubmit={(e) => void onSubmit(e)} noValidate aria-label="Request a quote" className="form">
        <h2>Get a quote</h2>
        <FormField id="q-origin" label="Origin port" error={errors.origin}>
          {(p) => <input {...p} className="input" value={values.origin} onChange={(e) => update('origin')(e.target.value)} />}
        </FormField>
        <FormField id="q-destination" label="Destination port" error={errors.destination}>
          {(p) => <input {...p} className="input" value={values.destination} onChange={(e) => update('destination')(e.target.value)} />}
        </FormField>
        <FormField id="q-weight" label="Weight (kg)" error={errors.weightKg}>
          {(p) => <input {...p} className="input" inputMode="decimal" value={values.weightKg} onChange={(e) => update('weightKg')(e.target.value)} />}
        </FormField>
        <FormField id="q-carrier" label="Carrier" error={errors.carrierCode}
          hint={multi ? 'Leave empty to compare all carriers' : undefined}>
          {(p) => (
            <CarrierSelect
              id={p.id}
              carriers={activeCarriers}
              value={values.carrierCode}
              onChange={update('carrierCode')}
              placeholder={multi ? 'All carriers' : 'Select a carrier'}
              invalid={p['aria-invalid']}
              describedBy={p['aria-describedby']}
            />
          )}
        </FormField>
        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Fetching…' : multi ? 'Compare quotes' : 'Get quote'}
          </button>
          {results.length > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={() => { reset(); setSubmitted(null); }}>Clear</button>
          ) : null}
        </div>
      </form>

      {status === 'error' ? <ErrorBanner message={QUOTE_ERROR_COPY} detail={describeError(error)} /> : null}
      {submitted && results.length > 0 ? (
        <p className="muted">Chargeable weight: {formatWeight(submitted.weightKg)}</p>
      ) : null}
      <div className="quotes">
        {results.map((r) => (
          <QuoteCard key={r.carrierCode} result={r} highlight={best === r.carrierCode && results.length > 1} />
        ))}
      </div>
    </div>
  );
}
