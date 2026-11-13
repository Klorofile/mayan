import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaveStatusBadge } from "./leave-status-badge";
import type { LeaveRequest } from "./types";

export function LeaveRequestTable({
  requests,
  onCancel
}: {
  requests: LeaveRequest[];
  onCancel?: (request: LeaveRequest) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attachment</TableHead>
            {onCancel && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="font-medium">{request.employee.fullName}</div>
                <div className="text-xs text-muted-foreground">{request.employee.employeeNumber}</div>
              </TableCell>
              <TableCell>{request.leaveType.name}</TableCell>
              <TableCell>
                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{request.totalDays}</TableCell>
              <TableCell>
                <LeaveStatusBadge status={request.status} />
              </TableCell>
              <TableCell>
                {request.attachmentUrl ? (
                  <a className="text-sm font-medium text-emerald-700 underline" href={request.attachmentUrl} target="_blank">
                    Open
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              {onCancel && (
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" disabled={request.status === "CANCELLED"} onClick={() => onCancel(request)}>
                    Cancel
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
