export type EmploymentStatus = "PROBATION" | "ACTIVE" | "RESIGNED" | "TERMINATED";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export type Employee = {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone?: string | null;
  gender?: Gender | null;
  birthDate?: string | null;
  hireDate: string;
  status: EmploymentStatus;
  branchId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  branch?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  position?: { id: string; name: string } | null;
  documents?: Array<Record<string, unknown>>;
  contracts?: Array<Record<string, unknown>>;
  salaries?: Array<Record<string, unknown>>;
  bankAccounts?: Array<Record<string, unknown>>;
  attendances?: Array<Record<string, unknown>>;
  leaveRequests?: Array<Record<string, unknown>>;
};

export type EmployeePayload = {
  employeeNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: Gender;
  birthDate?: string;
  branchId?: string;
  departmentId?: string;
  positionId?: string;
  hireDate: string;
  status: EmploymentStatus;
};

export type EmployeeListResponse = {
  data: Employee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
