export interface FlagEnv {
  VITE_FEATURE_MULTI_CARRIER_QUOTES?: string | undefined;
}

const TRUTHY = new Set(['1', 'true', 'on', 'yes', 'enabled']);

export function parseFlag(raw: string | undefined | null): boolean {
  if (raw === undefined || raw === null) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}

export function isMultiCarrierQuotesEnabled(env: FlagEnv = import.meta.env): boolean {
  return parseFlag(env.VITE_FEATURE_MULTI_CARRIER_QUOTES);
}
