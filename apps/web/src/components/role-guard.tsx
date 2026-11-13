"use client";

import { ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredUser } from "@/lib/auth";

export function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useMemo(() => getStoredUser(), []);
  const allowed = user?.roles?.some((role) => roles.includes(role));

  if (!allowed) {
    return (
      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="h-5 w-5" />
            Akses Payroll Dibatasi
          </CardTitle>
          <CardDescription>Halaman payroll hanya bisa diakses role HR_ADMIN dan SUPER_ADMIN.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Jika kamu seharusnya punya akses, hubungi administrator untuk memperbarui role akun.
        </CardContent>
      </Card>
    );
  }

  // RoleGuard hanya proteksi UX; backend RBAC tetap sumber kebenaran keamanan.
  return <>{children}</>;
}
