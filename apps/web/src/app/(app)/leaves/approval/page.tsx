"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { hrApproveLeave, listLeaves, managerApproveLeave, rejectLeave } from "@/features/leaves/api";
import { LeaveStatusBadge } from "@/features/leaves/leave-status-badge";

export default function LeaveApprovalPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["leaves", "approval"], queryFn: () => listLeaves({ page: 1, limit: 50, status: "PENDING" }) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["leaves"] });
  const managerMutation = useMutation({ mutationFn: (id: string) => managerApproveLeave(id, "Manager approved from web"), onSuccess: refresh });
  const hrMutation = useMutation({ mutationFn: (id: string) => hrApproveLeave(id, "HR approved from web"), onSuccess: refresh });
  const rejectMutation = useMutation({ mutationFn: (id: string) => rejectLeave(id, "Rejected from web"), onSuccess: refresh });

  const requests = data?.data ?? [];

  return (
    <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Leave Approval</CardTitle>
        <CardDescription>Manager approval dilanjutkan HR approval untuk mengurangi saldo cuti.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length ? (
          requests.map((request) => (
            <div key={request.id} className="flex flex-col gap-4 rounded-2xl border bg-slate-50/80 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{request.employee.fullName}</p>
                  <LeaveStatusBadge status={request.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.leaveType.name} • {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm">{request.reason}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={managerMutation.isPending} onClick={() => managerMutation.mutate(request.id)}>
                  Manager Approve
                </Button>
                <Button size="sm" disabled={hrMutation.isPending} onClick={() => hrMutation.mutate(request.id)}>
                  HR Approve
                </Button>
                <Button size="sm" variant="outline" disabled={rejectMutation.isPending} onClick={() => rejectMutation.mutate(request.id)}>
                  Reject
                </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="Tidak ada approval" description="Request pending akan tampil di sini." />
        )}
      </CardContent>
    </Card>
  );
}
