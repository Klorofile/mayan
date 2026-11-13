"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { cancelLeave, listLeaveBalances, listLeaves } from "@/features/leaves/api";
import { LeaveBalanceCards } from "@/features/leaves/leave-balance-cards";
import { LeaveRequestTable } from "@/features/leaves/leave-request-table";
import type { LeaveStatus } from "@/features/leaves/types";

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LeaveStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const filters = useMemo(() => ({ page: 1, limit: 20, status, startDate, endDate }), [status, startDate, endDate]);

  const { data: balances = [] } = useQuery({ queryKey: ["leave-balances"], queryFn: listLeaveBalances });
  const { data, isLoading } = useQuery({ queryKey: ["leaves", filters], queryFn: () => listLeaves(filters) });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelLeave(id, "Cancelled from web"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leaves"] });
      await queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Leave Management</p>
          <h1 className="text-3xl font-bold tracking-tight">Cuti & Izin</h1>
          <p className="text-muted-foreground">Kelola saldo cuti, pengajuan, approval, dan kalender absence.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/leaves/calendar">Calendar</Link>
          </Button>
          <Button asChild>
            <Link href="/leaves/apply">Apply Leave</Link>
          </Button>
        </div>
      </div>

      {balances.length ? <LeaveBalanceCards balances={balances} /> : <EmptyState title="Saldo cuti belum tersedia" description="HR perlu setup leave balance per employee/year." />}

      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Filter request berdasarkan tanggal dan status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value as LeaveStatus | "")}>
              <option value="">All status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          {isLoading ? (
            <LoadingState className="xl:grid-cols-2" />
          ) : data?.data.length ? (
            <LeaveRequestTable requests={data.data} onCancel={(request) => cancelMutation.mutate(request.id)} />
          ) : (
            <EmptyState title="Belum ada request" description="Leave request akan tampil setelah employee apply cuti/izin." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
