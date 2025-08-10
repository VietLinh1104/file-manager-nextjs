// src/components/dashboard/Breadcrumb.tsx
import React from "react";
import Link from "next/link";
import { labelize } from "@/utils/labelize";

type Props = { pathname: string };

export default function Breadcrumb({ pathname }: Props) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, i) => ({
    name: decodeURIComponent(part),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));

  if (crumbs.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm">
      <Link href="/" className="rounded-md px-1.5 py-0.5 hover:bg-muted/70">Home</Link>
      {crumbs.map((c, idx) => (
        <React.Fragment key={c.href}>
          <span className="opacity-50">/</span>
          {idx === crumbs.length - 1 ? (
            <span className="rounded-md px-1.5 py-0.5 font-medium">{labelize(c.name)}</span>
          ) : (
            <Link href={c.href} className="rounded-md px-1.5 py-0.5 hover:bg-muted/70">{labelize(c.name)}</Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}