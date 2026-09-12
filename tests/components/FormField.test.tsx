import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from '../../src/components/FormField';

describe('FormField', () => {
  it('associates the label with the control', () => {
    render(<FormField id="name" label="Name">{(p) => <input {...p} />}</FormField>);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('shows the error in preference to the hint and marks the input invalid', () => {
    render(
      <FormField id="name" label="Name" hint="a hint" error="Required">
        {(p) => <input {...p} />}
      </FormField>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Required');
    expect(screen.queryByText('a hint')).not.toBeInTheDocument();
  });

  it('shows the hint when there is no error', () => {
    render(<FormField id="n" label="N" hint="helpful">{(p) => <input {...p} />}</FormField>);
    expect(screen.getByLabelText('N')).toHaveAccessibleDescription('helpful');
  });
});
