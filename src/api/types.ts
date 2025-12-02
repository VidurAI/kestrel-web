/**
 * Domain types used by the UI (camelCase).
 * The gateway speaks snake_case; see wire.ts and mappers.ts for the translation.
 */

export type CarrierCode = 'NSL' | 'BLX' | 'PCR';

export type ShipmentStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Shipment {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  carrierCode: string;
  status: ShipmentStatus;
  eta: string | null;
}

export interface Carrier {
  code: string;
  name: string;
  active: boolean;
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  quoteId: string;
  amount: number;
  currency: string;
  breakdown: QuoteLine[];
}

export interface QuoteRequest {
  origin: string;
  destination: string;
  weightKg: number;
  carrierCode: string;
}

export interface CreateShipmentRequest {
  reference: string;
  origin: string;
  destination: string;
  carrierCode: string;
}
