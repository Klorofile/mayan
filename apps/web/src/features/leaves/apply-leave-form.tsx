"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyLeave, listLeaveTypes } from "./api";

const schema = z.object({
  employeeId: z.string().optional(),
  leaveTypeId: z.string().min(1, "Leave type wajib dipilih"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().min(8),
  attachmentUrl: z.string().url().optional().or(z.literal(""))
});

type FormValues = z.infer<typeof schema>;

export function ApplyLeaveForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data: leaveTypes = [] } = useQuery({ queryKey: ["leave-types"], queryFn: listLeaveTypes });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "", attachmentUrl: "" }
  });

  const mutation = useMutation({
    mutationFn: applyLeave,
    onSuccess: async () => {
      // Refresh leave list and balance after apply because backend validates quota and overlap.
      await queryClient.invalidateQueries({ queryKey: ["leaves"] });
      await queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      router.push("/leaves");
    },
    onError: (mutationError) => {
      const message = mutationError instanceof AxiosError ? mutationError.response?.data?.message ?? mutationError.message : "Gagal apply leave.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    }
  });

  return (
    <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Apply Leave</CardTitle>
        <CardDescription>Pilih leave type, date range, reason, dan attachment URL bila diperlukan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Employee ID">
            <Input {...form.register("employeeId")} placeholder="Kosongkan untuk user saat ini" />
          </Field>
          <Field label="Leave Type" error={form.formState.errors.leaveTypeId?.message}>
            <Select {...form.register("leaveTypeId")}>
              <option value="">Select leave type</option>
              {leaveTypes.map((leaveType) => (
                <option key={leaveType.id} value={leaveType.id}>
                  {leaveType.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start Date">
            <Input type="date" {...form.register("startDate")} />
          </Field>
          <Field label="End Date">
            <Input type="date" {...form.register("endDate")} />
          </Field>
          <Field label="Attachment URL">
            <Input {...form.register("attachmentUrl")} placeholder="https://..." />
          </Field>
          <div className="md:col-span-2">
            <Field label="Reason" error={form.formState.errors.reason?.message}>
              <Textarea {...form.register("reason")} placeholder="Jelaskan alasan cuti/izin" />
            </Field>
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</p>}
          <div className="flex gap-3 md:col-span-2">
            <Button disabled={mutation.isPending}>{mutation.isPending ? "Submitting..." : "Apply Leave"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
