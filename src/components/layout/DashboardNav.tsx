"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; label: string }[] = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/company/profile", label: "기업 프로필" },
  { href: "/requests", label: "TF 요청" },
  { href: "/contracts", label: "계약" },
  { href: "/settings", label: "설정" },
];

function navActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/company/profile") {
    return pathname === "/company/profile" || pathname.startsWith("/company/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴">
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
