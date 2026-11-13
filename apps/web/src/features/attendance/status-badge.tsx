import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceStatus, CorrectionStatus } from "./types";

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus | CorrectionStatus | string }) {
  return (
    <Badge
      className={cn(
        status === "PRESENT" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "LATE" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "ABSENT" && "border-red-200 bg-red-50 text-red-700",
        status === "PENDING" && "border-blue-200 bg-blue-50 text-blue-700",
        status === "APPROVED" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        status === "REJECTED" && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {status}
    </Badge>
  );
}
