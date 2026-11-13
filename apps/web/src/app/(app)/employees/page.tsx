"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listEmployees } from "@/features/employees/api";
import type { EmploymentStatus } from "@/features/employees/types";

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<EmploymentStatus | "">("");

  const filters = useMemo(
    () => ({ page, limit: 10, search, departmentId, status }),
    [page, search, departmentId, status]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => listEmployees(filters)
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Employee Management</p>
          <h1 className="text-3xl font-bold tracking-tight">Karyawan</h1>
          <p className="text-muted-foreground">Kelola master data karyawan, status, dan detail HRIS.</p>
        </div>
        <Button asChild>
          <Link href="/employees/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Employee
          </Link>
        </Button>
      </div>

      <Card className="border-0 bg-white/85 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Search dan filter langsung ke API `/employees` menggunakan TanStack Query.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px_200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, employee number, email..."
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
              />
            </div>
            <Input
              placeholder="Filter department UUID"
              value={departmentId}
              onChange={(event) => {
                setPage(1);
                setDepartmentId(event.target.value);
              }}
            />
            <Select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as EmploymentStatus | "");
              }}
            >
              <option value="">All status</option>
              <option value="PROBATION">Probation</option>
              <option value="ACTIVE">Active</option>
              <option value="RESIGNED">Resigned</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </div>

          {isLoading ? (
            <LoadingState className="xl:grid-cols-2" />
          ) : !data?.data.length ? (
            <EmptyState title="Belum ada karyawan" description="Tambahkan karyawan pertama untuk mulai memakai Employee Management." actionLabel="Create Employee" />
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.employeeNumber} • {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>{employee.department?.name ?? "-"}</TableCell>
                      <TableCell>{employee.position?.name ?? "-"}</TableCell>
                      <TableCell>{employee.branch?.name ?? "-"}</TableCell>
                      <TableCell>
                        <Badge>{employee.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/employees/${employee.id}`}>Detail</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Page {data?.meta.page ?? page} of {data?.meta.totalPages ?? 1} • Total {data?.meta.total ?? 0}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={!data || page >= data.meta.totalPages} onClick={() => setPage((value) => value + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
