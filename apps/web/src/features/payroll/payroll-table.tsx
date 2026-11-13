import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayrollStatusBadge } from "./payroll-status-badge";
import { formatCurrency } from "./payroll-summary-cards";
import type { Payroll } from "./types";

export function PayrollTable({ payrolls }: { payrolls: Payroll[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>Employee</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Gross</TableHead>
            <TableHead>Deduction</TableHead>
            <TableHead>Net</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.map((payroll) => (
            <TableRow key={payroll.id}>
              <TableCell>
                <div className="font-medium">{payroll.employee.fullName}</div>
                <div className="text-xs text-muted-foreground">{payroll.employee.employeeNumber}</div>
              </TableCell>
              <TableCell>{payroll.payrollPeriod.name}</TableCell>
              <TableCell>{formatCurrency(payroll.grossPay)}</TableCell>
              <TableCell>{formatCurrency(payroll.totalDeduction)}</TableCell>
              <TableCell>{formatCurrency(payroll.netPay)}</TableCell>
              <TableCell>
                <PayrollStatusBadge status={payroll.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/payroll/${payroll.id}`}>Detail</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
