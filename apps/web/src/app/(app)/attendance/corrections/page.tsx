"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AttendanceStatusBadge } from "@/features/attendance/status-badge";
import { approveCorrection, listAttendances, rejectCorrection, requestCorrection } from "@/features/attendance/api";

export default function AttendanceCorrectionsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ attendanceId: "", requestedClockInAt: "", requestedClockOutAt: "", reason: "" });
  const [error, setError] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["attendances", "correction-source"],
    queryFn: () => listAttendances({ page: 1, limit: 20 })
  });

  const corrections = data?.data.flatMap((record) => record.corrections ?? []) ?? [];

  const requestMutation = useMutation({
    mutationFn: () => requestCorrection(form),
    onSuccess: async () => {
      setForm({ attendanceId: "", requestedClockInAt: "", requestedClockOutAt: "", reason: "" });
      await queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
    onError: (mutationError) => {
      const message = mutationError instanceof AxiosError ? mutationError.response?.data?.message ?? mutationError.message : "Gagal request correction.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveCorrection(id, "Approved from dashboard"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendances"] })
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectCorrection(id, "Rejected from dashboard"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendances"] })
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>Attendance Correction</CardTitle>
          <CardDescription>Ajukan koreksi clock in/out jika ada kesalahan absensi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setError(null); requestMutation.mutate(); }}>
            <Field label="Attendance ID">
              <Input value={form.attendanceId} onChange={(event) => setForm({ ...form, attendanceId: event.target.value })} placeholder="Attendance UUID" />
            </Field>
            <Field label="Requested Clock In">
              <Input type="datetime-local" value={form.requestedClockInAt} onChange={(event) => setForm({ ...form, requestedClockInAt: event.target.value })} />
            </Field>
            <Field label="Requested Clock Out">
              <Input type="datetime-local" value={form.requestedClockOutAt} onChange={(event) => setForm({ ...form, requestedClockOutAt: event.target.value })} />
            </Field>
            <Field label="Reason">
              <Textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Minimal 8 karakter" />
            </Field>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <Button disabled={requestMutation.isPending}>{requestMutation.isPending ? "Submitting..." : "Submit Correction"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>Approval Correction</CardTitle>
          <CardDescription>Manager/HR dapat approve atau reject correction request.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {corrections.length ? (
            corrections.map((correction) => (
              <div key={correction.id} className="flex flex-col gap-3 rounded-2xl border bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{correction.reason}</p>
                  <div className="mt-2"><AttendanceStatusBadge status={correction.status} /></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate(correction.id)} disabled={approveMutation.isPending}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(correction.id)} disabled={rejectMutation.isPending}>Reject</Button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Belum ada correction request.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
