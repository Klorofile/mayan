export const DEFAULT_ROLES = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"] as const;

export const DEFAULT_PERMISSIONS = [
  "employee.read",
  "employee.create",
  "employee.update",
  "employee.delete",
  "dashboard.read",
  "attendance.read",
  "attendance.create",
  "leave.read",
  "leave.create",
  "leave.approve",
  "payroll.read",
  "payroll.generate",
  "role.read",
  "role.create",
  "role.update",
  "permission.read",
  "permission.create"
] as const;

export const ROLE_PERMISSION_MATRIX: Record<(typeof DEFAULT_ROLES)[number], string[]> = {
  SUPER_ADMIN: [...DEFAULT_PERMISSIONS],
  HR_ADMIN: [
    "employee.read",
    "employee.create",
    "employee.update",
    "attendance.read",
    "leave.read",
    "leave.create",
    "leave.approve",
    "payroll.read",
    "payroll.generate",
    "role.read",
    "permission.read"
  ],
  MANAGER: ["employee.read", "attendance.read", "leave.read", "leave.approve"],
  EMPLOYEE: ["employee.read", "attendance.create", "leave.read", "leave.create"]
};
