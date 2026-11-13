export type PayrollStatus = "DRAFT" | "CALCULATED" | "APPROVED" | "PAID" | "CANCELLED";
export type PayrollPeriodStatus = "OPEN" | "LOCKED" | "PROCESSED" | "CLOSED";
export type SalaryComponentType = "EARNING" | "DEDUCTION" | "BENEFIT" | "TAX";
export type CalculationType = "FIXED" | "PERCENTAGE" | "FORMULA";

export type SalaryComponent = {
  id: string;
  code: string;
  name: string;
  type: SalaryComponentType;
  calculationType: CalculationType;
  defaultAmount: string;
  isTaxable: boolean;
};

export type PayrollPeriod = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  paymentDate?: string | null;
  status: PayrollPeriodStatus;
};

export type PayrollComponent = {
  id: string;
  componentCode: string;
  componentName: string;
  type: SalaryComponentType;
  amount: string;
};

export type Payroll = {
  id: string;
  basicSalary: string;
  allowance: string;
  overtime: string;
  deduction: string;
  tax: string;
  grossPay: string;
  totalDeduction: string;
  netPay: string;
  status: PayrollStatus;
  employee: { id: string; employeeNumber: string; fullName: string; email: string };
  payrollPeriod: PayrollPeriod;
  components: PayrollComponent[];
};

export type PayrollListResponse = {
  data: Payroll[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
