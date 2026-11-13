import { Banknote, MinusCircle, PlusCircle, ReceiptText } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import type { Payroll } from "./types";

export function PayrollSummaryCards({ payrolls }: { payrolls: Payroll[] }) {
  const totalGross = payrolls.reduce((total, payroll) => total + Number(payroll.grossPay), 0);
  const totalDeduction = payrolls.reduce((total, payroll) => total + Number(payroll.totalDeduction), 0);
  const totalNet = payrolls.reduce((total, payroll) => total + Number(payroll.netPay), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FeatureCard title="Employees" value={payrolls.length} helper="Generated payroll rows" icon={ReceiptText} />
      <FeatureCard title="Gross Pay" value={formatCurrency(totalGross)} helper="Basic + allowance + overtime" icon={PlusCircle} />
      <FeatureCard title="Deductions" value={formatCurrency(totalDeduction)} helper="Deduction + tax" icon={MinusCircle} />
      <FeatureCard title="Net Pay" value={formatCurrency(totalNet)} helper="Take home pay" icon={Banknote} />
    </div>
  );
}

export function formatCurrency(value: number | string) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}
