import type { ReactNode } from "react";

type Variant = "success" | "error";

type Props = {
  variant: Variant;
  title: string;
  children?: ReactNode;
  className?: string;
};

/** 정적 토스트 UI 스켈레톤(Phase 1). 이후 클라이언트 포털·자동 소거 연동. */
export function Toast({ variant, title, children, className = "" }: Props) {
  const v = variant === "error" ? "sl-toast--error" : "sl-toast--success";
  return (
    <div className={`sl-toast ${v} ${className}`.trim()} role="status">
      <div>
        <p className="sl-toast__title">{title}</p>
        {children ? <p className="sl-toast__desc">{children}</p> : null}
      </div>
    </div>
  );
}
