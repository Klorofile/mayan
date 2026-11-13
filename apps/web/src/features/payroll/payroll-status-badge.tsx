import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PayrollPeriodStatus, PayrollStatus } from "./types";

export function PayrollStatusBadge({ status }: { status: PayrollStatus | PayrollPeriodStatus | string }) {
  return (
    <Badge
      className={cn(
        status === "CALCULATED" && "border-blue-200 bg-blue-50 text-blue-700",
        status === "PROCESSED" && "border-blue-200 bg-blue-50 text-blue-700",
        status === "LOCKED" && "border-slate-300 bg-slate-100 text-slate-700",
        status === "PAID" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "OPEN" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "DRAFT" && "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {status}
    </Badge>
  );
}
