"use client";

import { useQuery } from "@tanstack/react-query";
import { RoleGuard } from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listSalaryComponents } from "@/features/payroll/api";
import { SalaryComponentForm } from "@/features/payroll/salary-component-form";
import { formatCurrency } from "@/features/payroll/payroll-summary-cards";

export default function PayrollComponentsPage() {
  const { data: components = [] } = useQuery({ queryKey: ["salary-components"], queryFn: listSalaryComponents });

  return (
    <RoleGuard roles={["SUPER_ADMIN", "HR_ADMIN"]}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70"><CardHeader><CardTitle>Create Salary Component</CardTitle><CardDescription>Master earning, benefit, deduction, dan tax.</CardDescription></CardHeader><CardContent><SalaryComponentForm /></CardContent></Card>
        <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader><CardTitle>Salary Component Management</CardTitle><CardDescription>Komponen akan disnapshot saat payroll digenerate.</CardDescription></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Default</TableHead></TableRow></TableHeader>
              <TableBody>{components.map((component) => <TableRow key={component.id}><TableCell>{component.code}</TableCell><TableCell>{component.name}</TableCell><TableCell>{component.type}</TableCell><TableCell>{formatCurrency(component.defaultAmount)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
