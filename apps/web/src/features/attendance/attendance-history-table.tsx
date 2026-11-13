import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceStatusBadge } from "./status-badge";
import type { AttendanceRecord } from "./types";

export function AttendanceHistoryTable({ records }: { records: AttendanceRecord[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>Working</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div className="font-medium">{record.employee?.fullName ?? "Me"}</div>
                <div className="text-xs text-muted-foreground">{record.employee?.employeeNumber}</div>
              </TableCell>
              <TableCell>{new Date(record.attendanceDate).toLocaleDateString()}</TableCell>
              <TableCell>{record.clockInAt ? new Date(record.clockInAt).toLocaleTimeString() : "-"}</TableCell>
              <TableCell>{record.clockOutAt ? new Date(record.clockOutAt).toLocaleTimeString() : "-"}</TableCell>
              <TableCell>{record.lateMinutes} min</TableCell>
              <TableCell>{record.workingMinutes} min</TableCell>
              <TableCell>
                <AttendanceStatusBadge status={record.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
