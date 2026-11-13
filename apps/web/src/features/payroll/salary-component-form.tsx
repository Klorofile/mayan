"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSalaryComponent } from "./api";
import type { SalaryComponentType } from "./types";

export function SalaryComponentForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: "", name: "", type: "EARNING" as SalaryComponentType, defaultAmount: 0, isTaxable: false });
  const mutation = useMutation({
    mutationFn: createSalaryComponent,
    onSuccess: async () => {
      setForm({ code: "", name: "", type: "EARNING", defaultAmount: 0, isTaxable: false });
      await queryClient.invalidateQueries({ queryKey: ["salary-components"] });
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
      <div className="space-y-2">
        <Label>Code</Label>
        <Input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="ALLOWANCE_TRANSPORT" />
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Transport Allowance" />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SalaryComponentType })}>
          <option value="EARNING">Earning</option>
          <option value="BENEFIT">Benefit</option>
          <option value="DEDUCTION">Deduction</option>
          <option value="TAX">Tax</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Default Amount</Label>
        <Input type="number" value={form.defaultAmount} onChange={(event) => setForm({ ...form, defaultAmount: Number(event.target.value) })} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Create Component"}</Button>
      </div>
    </form>
  );
}
