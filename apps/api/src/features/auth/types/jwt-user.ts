export type JwtUser = {
  sub: string;
  companyId: string;
  employeeId?: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};
