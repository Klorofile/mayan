"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck,
  CreditCard,
  Gauge,
  LayoutDashboard,
  Settings,
  Target,
  Umbrella,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Karyawan", icon: Users },
  { href: "/attendance", label: "Absensi", icon: CalendarCheck },
  { href: "/leaves", label: "Cuti & Izin", icon: Umbrella },
  { href: "/payroll", label: "Payroll", icon: CreditCard },
  { href: "/recruitment", label: "Rekrutmen", icon: BriefcaseBusiness },
  { href: "/performance", label: "Kinerja", icon: Target },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings }
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-emerald-400/20 bg-slate-950 px-4 py-6 text-white lg:block">
      <div className="absolute inset-x-6 top-0 h-32 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative mb-8 px-3">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-[0_0_35px_rgba(74,222,128,0.65)]">
          <Gauge className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">MAYAN</p>
        <h1 className="text-2xl font-bold">People OS</h1>
      </div>
      <nav className="relative space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                active && "bg-emerald-400 text-slate-950 shadow-[0_0_28px_rgba(74,222,128,0.38)] hover:bg-emerald-400 hover:text-slate-950"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="relative mt-8 rounded-2xl border border-emerald-400/20 bg-white/5 p-4">
        <p className="text-sm font-semibold text-emerald-200">Enterprise ready</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">RBAC, payroll, leave, dan attendance dalam satu workspace.</p>
      </div>
    </aside>
  );
}
