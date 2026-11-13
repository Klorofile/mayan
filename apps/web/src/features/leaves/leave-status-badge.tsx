import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaveStatus } from "./types";

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <Badge
      className={cn(
        status === "PENDING" && "border-blue-200 bg-blue-50 text-blue-700",
        status === "APPROVED" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "REJECTED" && "border-red-200 bg-red-50 text-red-700",
        status === "CANCELLED" && "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      {status}
    </Badge>
  );
}
