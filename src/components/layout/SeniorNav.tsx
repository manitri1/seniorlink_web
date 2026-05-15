"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; label: string }[] = [
  { href: "/senior/dashboard", label: "대시보드" },
  { href: "/senior/proposals", label: "받은 제안" },
  { href: "/senior/contracts", label: "계약" },
  { href: "/senior/profile", label: "내 프로필" },
  { href: "/senior/settings", label: "설정" },
];

function navActive(pathname: string, href: string) {
  if (href === "/senior/dashboard") {
    return pathname === "/senior/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SeniorNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="시니어 주요 메뉴">
      <ul className="sl-nav">
        {NAV.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={navActive(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
