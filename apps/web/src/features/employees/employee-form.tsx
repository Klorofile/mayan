"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createEmployee, updateEmployee } from "./api";
import type { Employee, EmployeePayload } from "./types";

export const employeeSchema = z.object({
  employeeNumber: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  birthDate: z.string().optional(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  hireDate: z.string().min(1),
  status: z.enum(["PROBATION", "ACTIVE", "RESIGNED", "TERMINATED"]),
  employeeStatus: z.string().optional()
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function EmployeeForm({ mode, employee }: { mode: "create" | "edit"; employee?: Employee }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeNumber: employee?.employeeNumber ?? "",
      fullName: employee?.fullName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      gender: employee?.gender ?? undefined,
      birthDate: employee?.birthDate?.slice(0, 10) ?? "",
      branchId: employee?.branchId ?? "",
      departmentId: employee?.departmentId ?? "",
      positionId: employee?.positionId ?? "",
      hireDate: employee?.hireDate?.slice(0, 10) ?? "",
      status: employee?.status ?? "PROBATION",
      employeeStatus: employee?.status ?? "PROBATION"
    }
  });

  const mutation = useMutation({
    mutationFn: (values: EmployeeFormValues) => {
      const payload: EmployeePayload = {
        employeeNumber: values.employeeNumber,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        birthDate: values.birthDate,
        branchId: values.branchId,
        departmentId: values.departmentId,
        positionId: values.positionId,
        hireDate: values.hireDate,
        status: values.status
      };

      return mode === "create" ? createEmployee(payload) : updateEmployee(employee!.id, payload);
    },
    onSuccess: async (savedEmployee) => {
      // Invalidate list/detail cache so every Employee page reflects the saved backend state immediately.
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      await queryClient.invalidateQueries({ queryKey: ["employee", savedEmployee.id] });
      router.push(`/employees/${savedEmployee.id}`);
    }
  });

  return (
    <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create Employee" : "Edit Employee"}</CardTitle>
        <CardDescription>Lengkapi data dasar employee. Field department/position/branch menggunakan UUID master data.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Employee Number" error={form.formState.errors.employeeNumber?.message}>
            <Input {...form.register("employeeNumber")} placeholder="MYN-0002" />
          </Field>
          <Field label="Full Name" error={form.formState.errors.fullName?.message}>
            <Input {...form.register("fullName")} placeholder="Nama lengkap" />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} placeholder="employee@mayan.local" />
          </Field>
          <Field label="Phone">
            <Input {...form.register("phone")} placeholder="+62..." />
          </Field>
          <Field label="Gender">
            <Select {...form.register("gender")}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
          <Field label="Birth Date">
            <Input type="date" {...form.register("birthDate")} />
          </Field>
          <Field label="Department">
            <Input {...form.register("departmentId")} placeholder="Department UUID" />
          </Field>
          <Field label="Position">
            <Input {...form.register("positionId")} placeholder="Position UUID" />
          </Field>
          <Field label="Branch">
            <Input {...form.register("branchId")} placeholder="Branch UUID" />
          </Field>
          <Field label="Join Date" error={form.formState.errors.hireDate?.message}>
            <Input type="date" {...form.register("hireDate")} />
          </Field>
          <Field label="Employment Status">
            <Select {...form.register("status")}>
              <option value="PROBATION">Probation</option>
              <option value="ACTIVE">Active</option>
              <option value="RESIGNED">Resigned</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </Field>
          <Field label="Employee Status">
            <Select {...form.register("employeeStatus")}>
              <option value="PROBATION">Probation</option>
              <option value="ACTIVE">Active</option>
              <option value="RESIGNED">Resigned</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </Field>
          <div className="flex gap-3 md:col-span-2">
            <Button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save employee"}</Button>
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
