import type { ReactElement, ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined }) => ReactNode;
}

/** Label + control + hint/error wiring so every form field is accessible by label. */
export function FormField({ id, label, error, hint, children }: FormFieldProps): ReactElement {
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error) || Boolean(hint);
  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': hasMessage ? messageId : undefined,
      })}
      {hasMessage ? (
        <p id={messageId} className={error ? 'field__error' : 'field__hint'}>
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
