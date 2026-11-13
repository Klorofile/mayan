"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSession } from "@/lib/auth";

export function Topbar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">MAYAN HRIS</p>
          <h2 className="truncate text-lg font-semibold">Dashboard Operasional</h2>
        </div>
        <div className="hidden w-full max-w-md items-center gap-2 rounded-full border bg-slate-50 px-3 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input className="h-10 border-0 bg-transparent focus-visible:ring-0" placeholder="Search karyawan, payroll, laporan..." />
        </div>
        <Button variant="outline" size="sm" className="relative rounded-full">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
        </Button>
        <button className="hidden items-center gap-3 rounded-full border bg-white py-1 pl-1 pr-3 shadow-sm sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">MA</span>
          <span className="text-left">
            <span className="block text-sm font-semibold">MAYAN Admin</span>
            <span className="block text-xs text-muted-foreground">Super Admin</span>
          </span>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
