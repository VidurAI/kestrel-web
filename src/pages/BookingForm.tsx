import { useState, type FormEvent, type ReactElement } from 'react';
import { describeError, isApiError } from '../api/errors';
import { CarrierSelect } from '../components/CarrierSelect';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCarriers } from '../hooks/useCarriers';
import { useCreateShipment } from '../hooks/useCreateShipment';
import { BOOKING_UNAVAILABLE_COPY } from '../lib/copy';
import { useNavigate } from '../lib/router';
import {
  generateReference,
  hasErrors,
  normaliseLocode,
  validateBooking,
  type BookingField,
  type BookingFormValues,
  type FieldErrors,
} from '../lib/validation';

const EMPTY: BookingFormValues = { origin: '', destination: '', carrierCode: '', reference: '' };

function bookingErrorMessage(err: unknown): { message: string; detail: string | null } {
  if (isApiError(err) && err.isUnavailable) {
    return { message: BOOKING_UNAVAILABLE_COPY, detail: null };
  }
  return { message: "We couldn't create that booking", detail: describeError(err) };
}

export function BookingForm(): ReactElement {
  const navigate = useNavigate();
  const { activeCarriers, status: carriersStatus, error: carriersError, reload } = useCarriers();
  const { create, status, error, reset } = useCreateShipment();
  const [values, setValues] = useState<BookingFormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<BookingField>>({});

  const submitting = status === 'loading';
  const update = (field: BookingField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const found = validateBooking(values);
    setErrors(found);
    if (hasErrors(found)) return;

    const reference = values.reference.trim() === '' ? generateReference() : values.reference.trim().toUpperCase();
    const shipment = await create({
      reference,
      origin: normaliseLocode(values.origin),
      destination: normaliseLocode(values.destination),
      carrierCode: values.carrierCode,
    });
    if (shipment) navigate(`/shipments/${encodeURIComponent(shipment.id)}`);
  };

  if (carriersStatus === 'loading') return <LoadingSpinner label="Loading carriers" />;
  if (carriersStatus === 'error') {
    return <ErrorBanner message="We couldn't load carriers" detail={describeError(carriersError)} onRetry={reload} />;
  }

  const failure = status === 'error' ? bookingErrorMessage(error) : null;

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate aria-label="Book a shipment" className="form">
      <h2>Book a shipment</h2>
      {failure ? <ErrorBanner message={failure.message} detail={failure.detail} onDismiss={reset} /> : null}

      <FormField id="origin" label="Origin port" hint="UN/LOCODE, e.g. DEHAM" error={errors.origin}>
        {(props) => (
          <input {...props} className="input" value={values.origin} disabled={submitting}
            onChange={(e) => update('origin')(e.target.value)} />
        )}
      </FormField>

      <FormField id="destination" label="Destination port" hint="UN/LOCODE, e.g. SGSIN" error={errors.destination}>
        {(props) => (
          <input {...props} className="input" value={values.destination} disabled={submitting}
            onChange={(e) => update('destination')(e.target.value)} />
        )}
      </FormField>

      <FormField id="carrier" label="Carrier" error={errors.carrierCode}>
        {(props) => (
          <CarrierSelect
            id={props.id}
            carriers={activeCarriers}
            value={values.carrierCode}
            onChange={update('carrierCode')}
            disabled={submitting}
            invalid={props['aria-invalid']}
            describedBy={props['aria-describedby']}
          />
        )}
      </FormField>

      <FormField id="reference" label="Reference (optional)" hint="Leave blank to generate one" error={errors.reference}>
        {(props) => (
          <input {...props} className="input" value={values.reference} disabled={submitting}
            onChange={(e) => update('reference')(e.target.value)} />
        )}
      </FormField>

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? 'Booking…' : 'Create booking'}
      </button>
    </form>
  );
}
