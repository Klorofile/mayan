import type { RoleCode } from "./rbac";

export type AuthUser = {
  id: string;
  employeeId?: string;
  email: string;
  name: string;
  roles: RoleCode[];
  permissions: string[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
