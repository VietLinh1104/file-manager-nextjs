"use client";

import React, { useState, PropsWithChildren, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Folder, Home, Upload, Settings, Search, ChevronDown } from "lucide-react";
import { Breadcrumb, NavSection, NavList } from "@/components/dashboard";

/**
 * Dashboard Layout for the route group: src/app/(dashboard)/
 *
 * After splitting small components into separate files, this layout now imports:
 *  - Breadcrumb, NavSection, NavList from "@/components/dashboard"
 */
export default function DashboardLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false); // mobile sidebar
  const pathname = usePathname();

  // Define primary nav here (you can extend from your CMS or constants later)
  const nav = useMemo(
    () => [
      { href: "/", label: "Tổng quan", icon: Home },
      { href: "/files", label: "Tệp của tôi", icon: Folder },
      { href: "/uploads", label: "Upload", icon: Upload },
      { href: "/settings", label: "Cài đặt", icon: Settings },
    ],
    []
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-3 md:px-4">
          {/* Mobile menu button */}
          <button
            aria-label="Toggle sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90">
            <div className="grid h-8 w-8 place-items-center rounded-xl border text-xs font-semibold">FM</div>
            <span className="hidden text-sm font-semibold sm:inline">File Manager Admin</span>
          </Link>

          {/* Search */}
          <div className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-xl border px-2 py-1.5 md:flex">
            <Search className="h-4 w-4 opacity-60" />
            <input
              placeholder="Tìm kiếm tệp, thư mục…"
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-60"
            />
            <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] opacity-80 lg:inline-block">Ctrl K</kbd>
          </div>

          {/* User menu (simple) */}
          <button className="ml-auto inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 md:ml-3">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px]">VL</div>
            <span className="hidden text-sm md:inline">Linh</span>
            <ChevronDown className="hidden h-4 w-4 opacity-60 md:inline" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] border-r md:block">
          <div className="flex h-full flex-col px-3 py-3">
            <NavSection title="Làm việc" items={nav} pathname={pathname || "/"} />

            <div className="mt-auto pt-3 text-xs opacity-60">
              <p>v0.1.0</p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-h-[calc(100dvh-56px)] px-3 py-10 md:px-16">
          {/* Breadcrumb (basic) */}
          <Breadcrumb pathname={pathname || "/"} />

          <div className="mt-4">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 translate-x-0 bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-3 py-3">
              <span className="text-sm font-semibold">Menu</span>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-2 py-2">
              <NavList items={nav} pathname={pathname || "/"} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}