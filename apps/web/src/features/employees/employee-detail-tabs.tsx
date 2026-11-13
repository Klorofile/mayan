"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Employee } from "./types";

const tabs = ["Profile", "Documents", "Contract", "Salary", "Bank Account", "Attendance", "Leave"] as const;

export function EmployeeDetailTabs({ employee }: { employee: Employee }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Profile");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition",
              activeTab === tab && "bg-emerald-500 text-white shadow-sm"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "Profile" && <ProfileTab employee={employee} />}
      {activeTab === "Documents" && <ArrayTab title="Documents" data={employee.documents ?? []} />}
      {activeTab === "Contract" && <ArrayTab title="Contract" data={employee.contracts ?? []} />}
      {activeTab === "Salary" && <ArrayTab title="Salary History" data={employee.salaries ?? []} />}
      {activeTab === "Bank Account" && <ArrayTab title="Bank Account" data={employee.bankAccounts ?? []} />}
      {activeTab === "Attendance" && <ArrayTab title="Attendance" data={employee.attendances ?? []} />}
      {activeTab === "Leave" && <ArrayTab title="Leave" data={employee.leaveRequests ?? []} />}
    </div>
  );
}

function ProfileTab({ employee }: { employee: Employee }) {
  const rows = [
    ["Employee Number", employee.employeeNumber],
    ["Full Name", employee.fullName],
    ["Email", employee.email],
    ["Phone", employee.phone ?? "-"],
    ["Gender", employee.gender ?? "-"],
    ["Birth Date", employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : "-"],
    ["Department", employee.department?.name ?? "-"],
    ["Position", employee.position?.name ?? "-"],
    ["Branch", employee.branch?.name ?? "-"],
    ["Join Date", employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "-"]
  ];

  return (
    <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Informasi utama karyawan.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 font-medium">{value}</p>
          </div>
        ))}
        <div className="rounded-2xl border bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
          <Badge className="mt-2">{employee.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ArrayTab({ title, data }: { title: string; data: Array<Record<string, unknown>> }) {
  if (!data.length) return <EmptyState title={`${title} kosong`} description={`Belum ada data ${title.toLowerCase()} untuk employee ini.`} />;

  return (
    <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Data terkait employee dari backend.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, index) => (
          <pre key={index} className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-emerald-100">
            {JSON.stringify(item, null, 2)}
          </pre>
        ))}
      </CardContent>
    </Card>
  );
}
