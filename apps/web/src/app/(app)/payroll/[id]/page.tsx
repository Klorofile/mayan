"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPayroll, getPayslip } from "@/features/payroll/api";
import { PayrollStatusBadge } from "@/features/payroll/payroll-status-badge";
import { formatCurrency } from "@/features/payroll/payroll-summary-cards";

export default function PayrollDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: payroll, isLoading } = useQuery({ queryKey: ["payroll", params.id], queryFn: () => getPayroll(params.id) });
  const { data: payslip } = useQuery({ queryKey: ["payslip", params.id], queryFn: () => getPayslip(params.id) });

  if (isLoading) return <LoadingState className="xl:grid-cols-2" />;
  if (!payroll) return null;

  return (
    <RoleGuard roles={["SUPER_ADMIN", "HR_ADMIN"]}>
      <div className="space-y-6">
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader><CardTitle>Payroll Detail</CardTitle><CardDescription>{payroll.employee.fullName} • {payroll.payrollPeriod.name}</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              ["Basic Salary", payroll.basicSalary],
              ["Allowance", payroll.allowance],
              ["Overtime", payroll.overtime],
              ["Deduction", payroll.deduction],
              ["Tax", payroll.tax],
              ["Net Salary", payroll.netPay]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-slate-50/80 p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(value)}</p>
              </div>
            ))}
            <div className="rounded-2xl border bg-slate-50/80 p-4"><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><PayrollStatusBadge status={payroll.status} /></div></div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader><CardTitle>Payroll Component Detail</CardTitle><CardDescription>Snapshot component name and amount.</CardDescription></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
              <TableBody>{payroll.components.map((component) => <TableRow key={component.id}><TableCell>{component.componentCode}</TableCell><TableCell>{component.componentName}</TableCell><TableCell>{component.type}</TableCell><TableCell>{formatCurrency(component.amount)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-0 bg-slate-950 text-white shadow-xl">
          <CardHeader><CardTitle>Payslip Preview</CardTitle><CardDescription className="text-slate-300">Data payslip dari endpoint `/payrolls/:id/payslip`.</CardDescription></CardHeader>
          <CardContent><pre className="overflow-auto rounded-2xl bg-white/5 p-4 text-xs text-emerald-100">{JSON.stringify(payslip ?? payroll, null, 2)}</pre></CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
