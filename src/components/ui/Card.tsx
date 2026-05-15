import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  className?: string;
};

export function Card({ children, title, className = "" }: Props) {
  return (
    <section className={`sl-card ${className}`.trim()}>
      {title ? <h2 className="sl-card__header">{title}</h2> : null}
      {children}
    </section>
  );
}
