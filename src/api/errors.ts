/** Error thrown for any non-2xx response or network failure. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | null;

  constructor(status: number, message: string, detail: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isUnavailable(): boolean {
    return this.status === 503;
  }

  get isValidation(): boolean {
    return this.status === 422 || this.status === 400;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** Extracts FastAPI-style `{ "detail": ... }` messages from an error body. */
export function extractDetail(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (typeof d === 'object' && d !== null ? (d as { msg?: unknown }).msg : null))
      .filter((m): m is string => typeof m === 'string');
    return msgs.length > 0 ? msgs.join('; ') : null;
  }
  return null;
}

export function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return 'Network error. Check your connection and try again.';
    return err.detail ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
