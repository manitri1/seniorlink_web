import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "cta" | "outline";

type Props = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: Props) {
  const variantClass =
    variant === "cta"
      ? "sl-button--cta"
      : variant === "outline"
        ? "sl-button--outline"
        : "sl-button--primary";

  return (
    <button
      type={type}
      className={`sl-button ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
