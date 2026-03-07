export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const LOCODE = /^[A-Z]{2}[A-Z0-9]{3}$/;
const REFERENCE = /^[A-Z0-9][A-Z0-9-]{5,31}$/;
export const MAX_WEIGHT_KG = 50000;

export function normaliseLocode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validateLocode(raw: string, label: string): string | undefined {
  const value = normaliseLocode(raw);
  if (value === '') return `${label} is required`;
  if (!LOCODE.test(value)) return `${label} must be a 5-character UN/LOCODE (e.g. DEHAM)`;
  return undefined;
}

export interface BookingFormValues {
  origin: string;
  destination: string;
  carrierCode: string;
  reference: string;
}

export type BookingField = keyof BookingFormValues;

export function validateBooking(values: BookingFormValues): FieldErrors<BookingField> {
  const errors: FieldErrors<BookingField> = {};
  const originErr = validateLocode(values.origin, 'Origin');
  if (originErr) errors.origin = originErr;
  const destErr = validateLocode(values.destination, 'Destination');
  if (destErr) errors.destination = destErr;
  if (!originErr && !destErr && normaliseLocode(values.origin) === normaliseLocode(values.destination)) {
    errors.destination = 'Destination must differ from origin';
  }
  if (values.carrierCode === '') errors.carrierCode = 'Choose a carrier';
  const ref = values.reference.trim().toUpperCase();
  if (ref !== '' && !REFERENCE.test(ref)) {
    errors.reference = 'Reference must be 6-32 characters: letters, digits and dashes';
  }
  return errors;
}

export interface QuoteFormValues {
  origin: string;
  destination: string;
  weightKg: string;
  carrierCode: string;
}

export type QuoteField = keyof QuoteFormValues;

export function validateQuote(
  values: QuoteFormValues,
  options: { carrierRequired: boolean },
): FieldErrors<QuoteField> {
  const errors: FieldErrors<QuoteField> = {};
  const originErr = validateLocode(values.origin, 'Origin');
  if (originErr) errors.origin = originErr;
  const destErr = validateLocode(values.destination, 'Destination');
  if (destErr) errors.destination = destErr;

  const weight = Number(values.weightKg);
  if (values.weightKg.trim() === '' || Number.isNaN(weight)) {
    errors.weightKg = 'Weight is required';
  } else if (weight <= 0) {
    errors.weightKg = 'Weight must be greater than zero';
  } else if (weight > MAX_WEIGHT_KG) {
    errors.weightKg = `Weight cannot exceed ${MAX_WEIGHT_KG} kg`;
  }
  if (options.carrierRequired && values.carrierCode === '') {
    errors.carrierCode = 'Choose a carrier';
  }
  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

export function generateReference(now: Date = new Date(), rand: () => number = Math.random): string {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(rand() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0');
  return `KF-${stamp}-${suffix}`;
}
