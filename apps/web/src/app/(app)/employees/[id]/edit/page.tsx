"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { getEmployee } from "@/features/employees/api";
import { EmployeeForm } from "@/features/employees/employee-form";

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", params.id],
    queryFn: () => getEmployee(params.id)
  });

  if (isLoading) return <LoadingState className="xl:grid-cols-2" />;
  if (!employee) return null;

  return <EmployeeForm mode="edit" employee={employee} />;
}
