import type { TextareaHTMLAttributes } from "react";

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  id,
  label,
  hint,
  error,
  className = "",
  rows = 5,
  ...rest
}: Props) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="sl-field">
      <label className="sl-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={`sl-input sl-input--multiline ${error ? "sl-input--error" : ""} ${className}`.trim()}
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
