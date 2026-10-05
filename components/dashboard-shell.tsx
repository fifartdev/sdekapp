"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  ShieldCheck,
  Building2,
  ClipboardList,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { CurrentUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Επισκόπηση", icon: LayoutDashboard, adminOnly: false },
  { href: "/match-days", label: "Αγωνιστικές", icon: CalendarDays, adminOnly: false },
  { href: "/my-assignments", label: "Οι Ορισμοί μου", icon: ClipboardList, adminOnly: false },
  { href: "/admin/referees", label: "Διαχείριση Διαιτητών", icon: ShieldCheck, adminOnly: true },
  { href: "/admin/seasons", label: "Αγωνιστικές Περίοδοι", icon: CalendarRange, adminOnly: true },
  { href: "/teams", label: "Ομάδες", icon: Users, adminOnly: true },
  { href: "/arenas", label: "Γήπεδα", icon: Building2, adminOnly: true },
];

function NavLinks({ user, pathname, onNavigate }: { user: CurrentUser; pathname: string; onNavigate?: () => void }) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "admin");
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      {user.role === "admin" ? (
        <Link
          href="/match-days/new"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-3 rounded-md border border-dashed border-primary/40 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Νέα Αγωνιστική
        </Link>
      ) : null}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-2">
      <Image
        src="/logo-oseka.png"
        alt="ΟΣΕΚΑ"
        width={292}
        height={90}
        className="h-8 w-auto rounded bg-primary p-1"
      />
      <div className="leading-tight">
        <div className="text-sm font-bold">ΚΕΔ ΟΣΕΚΑ</div>
        <div className="text-xs text-muted-foreground">Ορισμοί Διαιτητών</div>
      </div>
    </Link>
  );
}

function SidebarFooter({ user }: { user: CurrentUser }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border px-2 pt-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{user.referee?.name ?? user.email}</div>
        <div className="text-xs text-muted-foreground">{user.role === "admin" ? "Διαχειριστής" : "Διαιτητής"}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle variant="ghost" />
        <SignOutButton variant="ghost" iconOnly />
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r border-border bg-card p-4 lg:flex">
        <SidebarHeader />
        <div className="flex-1 overflow-y-auto">
          <NavLinks user={user} pathname={pathname} />
        </div>
        <SidebarFooter user={user} />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex flex-1 flex-col lg:hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <SidebarHeader />
          <button onClick={() => setOpen(true)} aria-label="Μενού">
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-4 bg-card p-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <SidebarHeader />
                  <button onClick={() => setOpen(false)} aria-label="Κλείσιμο">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <NavLinks user={user} pathname={pathname} onNavigate={() => setOpen(false)} />
                </div>
                <SidebarFooter user={user} />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>
        <main className="flex-1 p-4">
          <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>

      {/* Desktop content */}
      <main className="hidden flex-1 overflow-y-auto p-8 lg:block">
        <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
