import type {
  Carrier,
  CreateShipmentRequest,
  Quote,
  QuoteLine,
  QuoteRequest,
  Shipment,
  ShipmentStatus,
} from './types';
import type {
  CarrierWire,
  CreateShipmentWire,
  QuoteLineWire,
  QuoteRequestWire,
  QuoteWire,
  ShipmentWire,
} from './wire';

const KNOWN_STATUSES: readonly ShipmentStatus[] = [
  'PENDING',
  'RESERVED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
];

export function toShipmentStatus(raw: string): ShipmentStatus {
  const upper = raw.trim().toUpperCase();
  const match = KNOWN_STATUSES.find((s) => s === upper);
  return match ?? 'PENDING';
}

export function mapShipment(wire: ShipmentWire): Shipment {
  return {
    id: String(wire.id),
    reference: wire.reference,
    origin: wire.origin,
    destination: wire.destination,
    carrierCode: wire.carrier_code,
    status: toShipmentStatus(wire.status),
    eta: wire.eta ?? null,
  };
}

export function mapCarrier(wire: CarrierWire): Carrier {
  return { code: wire.code, name: wire.name, active: wire.active ?? true };
}

function mapQuoteLine(wire: QuoteLineWire): QuoteLine {
  return { label: wire.label, amount: wire.amount };
}

export function mapQuote(wire: QuoteWire): Quote {
  return {
    quoteId: wire.quote_id,
    amount: wire.amount,
    currency: wire.currency,
    breakdown: (wire.breakdown ?? []).map(mapQuoteLine),
  };
}

export function quoteRequestToWire(req: QuoteRequest): QuoteRequestWire {
  return {
    origin: req.origin,
    destination: req.destination,
    weight_kg: req.weightKg,
    carrier_code: req.carrierCode,
  };
}

export function createShipmentToWire(req: CreateShipmentRequest): CreateShipmentWire {
  return {
    reference: req.reference,
    origin: req.origin,
    destination: req.destination,
    carrier_code: req.carrierCode,
  };
}
