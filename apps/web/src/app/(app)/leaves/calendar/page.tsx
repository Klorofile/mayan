"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { leaveCalendar } from "@/features/leaves/api";
import { LeaveStatusBadge } from "@/features/leaves/leave-status-badge";

export default function LeaveCalendarPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10));
  const { data = [] } = useQuery({ queryKey: ["leave-calendar", startDate, endDate], queryFn: () => leaveCalendar(startDate, endDate) });

  const days = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result: Date[] = [];
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      result.push(new Date(cursor));
    }
    return result;
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>Leave Calendar</CardTitle>
          <CardDescription>Calendar sederhana berdasarkan request pending dan approved.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => {
          const leaves = data.filter((leave) => new Date(leave.startDate) <= day && new Date(leave.endDate) >= day);
          return (
            <div key={day.toISOString()} className="min-h-32 rounded-2xl border bg-white/85 p-4 shadow-sm">
              <p className="text-sm font-semibold">{day.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" })}</p>
              <div className="mt-3 space-y-2">
                {leaves.map((leave) => (
                  <div key={leave.id} className="rounded-xl bg-emerald-50 p-2">
                    <p className="text-sm font-medium">{leave.employee.fullName}</p>
                    <div className="mt-1">
                      <LeaveStatusBadge status={leave.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!data.length && <EmptyState title="Calendar kosong" description="Tidak ada cuti/izin pada rentang tanggal ini." />}
    </div>
  );
}
