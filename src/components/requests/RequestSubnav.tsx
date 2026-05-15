"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { requestId: string };

export function RequestSubnav({ requestId }: Props) {
  const pathname = usePathname();
  const base = `/requests/${requestId}`;
  const tabs: { href: string; label: string }[] = [
    { href: base, label: "개요" },
    { href: `${base}/matches`, label: "매칭 결과" },
    { href: `${base}/proposals`, label: "제안" },
  ];

  return (
    <nav aria-label="요청 하위 메뉴" style={{ marginBottom: "var(--space-stack)" }}>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {tabs.map(({ href, label }) => {
          const active =
            href === base
              ? pathname === base
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={active ? "sl-button sl-button--primary" : "sl-button sl-button--outline"}
                style={{
                  display: "inline-flex",
                  minHeight: "40px",
                  padding: "8px 16px",
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                }}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
