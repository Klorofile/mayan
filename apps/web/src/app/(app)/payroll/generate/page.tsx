"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { generatePayroll, listPeriods } from "@/features/payroll/api";

export default function GeneratePayrollPage() {
  const queryClient = useQueryClient();
  const [periodId, setPeriodId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const { data: periods = [] } = useQuery({ queryKey: ["payroll-periods"], queryFn: listPeriods });
  const mutation = useMutation({
    mutationFn: () => generatePayroll(periodId, employeeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      await queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    }
  });

  return (
    <RoleGuard roles={["SUPER_ADMIN", "HR_ADMIN"]}>
      <Card className="mx-auto max-w-2xl border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader><CardTitle>Generate Payroll</CardTitle><CardDescription>Kosongkan employee ID untuk generate semua employee aktif dalam company.</CardDescription></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
            <div className="space-y-2">
              <Label>Payroll Period</Label>
              <Select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
                <option value="">Select period</option>
                {periods.map((period) => <option key={period.id} value={period.id}>{period.name} ({period.status})</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="Optional employee UUID" />
            </div>
            {mutation.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Generate payroll gagal. Pastikan periode belum LOCKED dan salary employee sudah ada.</p>}
            {mutation.data && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Generated {mutation.data.length} payroll rows.</p>}
            <Button disabled={!periodId || mutation.isPending}>{mutation.isPending ? "Generating..." : "Generate Payroll"}</Button>
          </form>
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
