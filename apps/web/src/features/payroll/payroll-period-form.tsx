"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPeriod } from "./api";

export function PayrollPeriodForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: "", name: "", startDate: "", endDate: "", paymentDate: "" });
  const mutation = useMutation({
    mutationFn: createPeriod,
    onSuccess: async () => {
      setForm({ code: "", name: "", startDate: "", endDate: "", paymentDate: "" });
      await queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
      {([
        ["code", "Code", "2026-05"],
        ["name", "Name", "May 2026 Payroll"],
        ["startDate", "Start Date", ""],
        ["endDate", "End Date", ""],
        ["paymentDate", "Payment Date", ""]
      ] as const).map(([key, label, placeholder]) => (
        <div key={key} className="space-y-2">
          <Label>{label}</Label>
          <Input
            type={key.toLowerCase().includes("date") ? "date" : "text"}
            value={form[key]}
            placeholder={placeholder}
            onChange={(event) => setForm({ ...form, [key]: event.target.value })}
          />
        </div>
      ))}
      <div className="md:col-span-2">
        <Button disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create Payroll Period"}</Button>
      </div>
    </form>
  );
}
