export type EmployeeStatus = "ACTIVE" | "PROBATION" | "RESIGNED" | "TERMINATED";

export type EmployeeSummary = {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  departmentName: string;
  jobTitle: string;
  status: EmployeeStatus;
  joinedAt: string;
};

export type CreateEmployeeRequest = {
  employeeNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: string;
  jobTitle: string;
  joinedAt: string;
};
