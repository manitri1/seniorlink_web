import type { InputHTMLAttributes } from "react";

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({ id, label, hint, error, className = "", ...rest }: Props) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="sl-field">
      <label className="sl-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`sl-input ${error ? "sl-input--error" : ""} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint ? (
        <p id={`${id}-hint`} className="sl-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="sl-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
