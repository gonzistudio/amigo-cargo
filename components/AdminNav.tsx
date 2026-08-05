"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tarifas" },
  { href: "/admin/cuenta", label: "Mi cuenta" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-tabs">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
