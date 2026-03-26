import type { ReactElement } from 'react';
import type { Carrier } from '../api/types';

interface CarrierSelectProps {
  id: string;
  carriers: readonly Carrier[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string | undefined;
}

export function CarrierSelect({
  id,
  carriers,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a carrier',
  invalid = false,
  describedBy,
}: CarrierSelectProps): ReactElement {
  return (
    <select
      id={id}
      className="input"
      value={value}
      disabled={disabled}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {carriers.map((c) => (
        <option key={c.code} value={c.code} disabled={!c.active}>
          {c.name} ({c.code})
          {c.active ? '' : ' - unavailable'}
        </option>
      ))}
    </select>
  );
}
