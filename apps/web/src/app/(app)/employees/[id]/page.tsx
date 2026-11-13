"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { EmployeeDetailTabs } from "@/features/employees/employee-detail-tabs";
import { getEmployee } from "@/features/employees/api";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", params.id],
    queryFn: () => getEmployee(params.id)
  });

  if (isLoading) return <LoadingState className="xl:grid-cols-2" />;
  if (!employee) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Employee Detail</p>
          <h1 className="text-3xl font-bold tracking-tight">{employee.fullName}</h1>
          <p className="text-muted-foreground">{employee.employeeNumber}</p>
        </div>
        <Button asChild>
          <Link href={`/employees/${employee.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Employee
          </Link>
        </Button>
      </div>
      <EmployeeDetailTabs employee={employee} />
    </div>
  );
}
