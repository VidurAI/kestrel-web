/** Snake_case payloads exactly as the gateway sends and receives them. */

export interface ShipmentWire {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  carrier_code: string;
  status: string;
  eta: string | null;
}

export interface CarrierWire {
  code: string;
  name: string;
  active?: boolean;
}

export interface QuoteLineWire {
  label: string;
  amount: number;
}

export interface QuoteWire {
  quote_id: string;
  amount: number;
  currency: string;
  breakdown: QuoteLineWire[];
}

export interface QuoteRequestWire {
  origin: string;
  destination: string;
  weight_kg: number;
  carrier_code: string;
}

export interface CreateShipmentWire {
  reference: string;
  origin: string;
  destination: string;
  carrier_code: string;
}
