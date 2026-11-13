export type RoleCode = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE" | "PAYROLL_ADMIN";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "export";

export type PermissionResource =
  | "employee"
  | "attendance"
  | "leave"
  | "payroll"
  | "role"
  | "permission"
  | "dashboard";

export type PermissionCode = `${PermissionResource}:${PermissionAction}`;

export type RolePermissionMatrix = Record<RoleCode, PermissionCode[]>;
