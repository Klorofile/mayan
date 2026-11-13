export type DashboardSummary = {
  totals: {
    totalEmployees: number;
    todayAttendance: number;
    activeLeaves: number;
    currentMonthPayroll: string;
  };
  weeklyAttendance: Array<{ date: string; label: string; attendance: number }>;
  latestLeaveRequests: Array<{
    id: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  employeesByDepartment: Array<{ name: string; value: number }>;
  employeesByLocation: Array<{ name: string; value: number }>;
  payrollReminder: { id: string; name: string; status: string; paymentDate?: string | null } | null;
  expiringContracts: Array<{ id: string; employeeName: string; contractNumber: string; endDate?: string | null }>;
};
