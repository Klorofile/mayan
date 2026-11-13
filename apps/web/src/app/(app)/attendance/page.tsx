"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { AttendanceHistoryTable } from "@/features/attendance/attendance-history-table";
import { AttendanceSummary } from "@/features/attendance/attendance-summary";
import { listAttendances } from "@/features/attendance/api";
import type { AttendanceStatus } from "@/features/attendance/types";

export default function AttendancePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "">("");
  const filters = useMemo(() => ({ page: 1, limit: 20, startDate, endDate, status }), [startDate, endDate, status]);

  const { data, isLoading } = useQuery({
    queryKey: ["attendances", filters],
    queryFn: () => listAttendances(filters)
  });

  const records = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Attendance</p>
          <h1 className="text-3xl font-bold tracking-tight">Absensi</h1>
          <p className="text-muted-foreground">Monitor attendance company, filter tanggal, dan status kehadiran.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/attendance/my">My Attendance</Link>
          </Button>
          <Button asChild>
            <Link href="/attendance/corrections">Corrections</Link>
          </Button>
        </div>
      </div>

      <AttendanceSummary records={records} />

      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Data terhubung ke endpoint `/attendances` dengan filter date range dan status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value as AttendanceStatus | "")}>
              <option value="">All status</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
              <option value="SICK">Sick</option>
              <option value="PERMISSION">Permission</option>
            </Select>
          </div>
          {isLoading ? (
            <LoadingState className="xl:grid-cols-2" />
          ) : records.length ? (
            <AttendanceHistoryTable records={records} />
          ) : (
            <EmptyState title="Belum ada absensi" description="Data absensi akan tampil setelah employee melakukan clock in." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
