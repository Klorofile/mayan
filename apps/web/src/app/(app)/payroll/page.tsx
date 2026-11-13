"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { exportPayrollCsvUrl, listPayrolls, listPeriods } from "@/features/payroll/api";
import { PayrollSummaryCards } from "@/features/payroll/payroll-summary-cards";
import { PayrollTable } from "@/features/payroll/payroll-table";
import type { PayrollStatus } from "@/features/payroll/types";

export default function PayrollPage() {
  const [periodId, setPeriodId] = useState("");
  const [status, setStatus] = useState<PayrollStatus | "">("");
  const filters = useMemo(() => ({ page: 1, limit: 20, payrollPeriodId: periodId, status }), [periodId, status]);
  const { data: periods = [] } = useQuery({ queryKey: ["payroll-periods"], queryFn: listPeriods });
  const { data, isLoading } = useQuery({ queryKey: ["payrolls", filters], queryFn: () => listPayrolls(filters) });
  const payrolls = data?.data ?? [];

  return (
    <RoleGuard roles={["SUPER_ADMIN", "HR_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Payroll</p>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Summary</h1>
            <p className="text-muted-foreground">Generate, review, export, dan preview payslip payroll.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/payroll/periods">Periods</Link></Button>
            <Button asChild variant="outline"><Link href="/payroll/components">Components</Link></Button>
            <Button asChild><Link href="/payroll/generate">Generate Payroll</Link></Button>
          </div>
        </div>

        <PayrollSummaryCards payrolls={payrolls} />

        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle>Payroll Employee List</CardTitle>
            <CardDescription>Filter payroll by period and status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <Select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
                <option value="">All periods</option>
                {periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
              </Select>
              <Select value={status} onChange={(event) => setStatus(event.target.value as PayrollStatus | "")}>
                <option value="">All status</option>
                <option value="DRAFT">Draft</option>
                <option value="CALCULATED">Calculated</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
              </Select>
              <Button asChild variant="outline" disabled={!periodId}>
                <a href={periodId ? exportPayrollCsvUrl(periodId) : "#"}>Export CSV</a>
              </Button>
            </div>
            {isLoading ? <LoadingState className="xl:grid-cols-2" /> : payrolls.length ? <PayrollTable payrolls={payrolls} /> : <EmptyState title="Payroll kosong" description="Generate payroll untuk melihat daftar employee payroll." />}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
