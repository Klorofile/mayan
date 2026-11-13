"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { AttendanceHistoryTable } from "@/features/attendance/attendance-history-table";
import { AttendanceSummary } from "@/features/attendance/attendance-summary";
import { listAttendances } from "@/features/attendance/api";
import { ClockCard } from "@/features/attendance/clock-card";

export default function MyAttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["attendances", "my"],
    queryFn: () => listAttendances({ page: 1, limit: 10 })
  });
  const records = data?.data ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
      <div className="space-y-6">
        <ClockCard />
        <AttendanceSummary records={records} />
      </div>
      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>My History</CardTitle>
          <CardDescription>Riwayat absensi terbaru untuk user saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState className="xl:grid-cols-1" />
          ) : records.length ? (
            <AttendanceHistoryTable records={records} />
          ) : (
            <EmptyState title="Belum ada riwayat" description="Clock in pertama kamu akan tampil di sini." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
