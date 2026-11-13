"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listPeriods, lockPeriod } from "@/features/payroll/api";
import { PayrollPeriodForm } from "@/features/payroll/payroll-period-form";
import { PayrollStatusBadge } from "@/features/payroll/payroll-status-badge";

export default function PayrollPeriodsPage() {
  const queryClient = useQueryClient();
  const { data: periods = [] } = useQuery({ queryKey: ["payroll-periods"], queryFn: listPeriods });
  const mutation = useMutation({
    mutationFn: lockPeriod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll-periods"] })
  });

  return (
    <RoleGuard roles={["SUPER_ADMIN", "HR_ADMIN"]}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader><CardTitle>Create Payroll Period</CardTitle><CardDescription>Buat periode payroll baru.</CardDescription></CardHeader>
          <CardContent><PayrollPeriodForm /></CardContent>
        </Card>
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader><CardTitle>Payroll Period Table</CardTitle><CardDescription>Lock period untuk mencegah generate ulang.</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border bg-white">
              <Table>
                <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell><div className="font-medium">{period.name}</div><div className="text-xs text-muted-foreground">{period.code}</div></TableCell>
                      <TableCell>{new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}</TableCell>
                      <TableCell><PayrollStatusBadge status={period.status} /></TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="outline" disabled={period.status === "LOCKED" || mutation.isPending} onClick={() => mutation.mutate(period.id)}>Lock</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
