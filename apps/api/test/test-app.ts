import { INestApplication, ValidationPipe } from "@nestjs/common";

export function configureTestApp(app: INestApplication) {
  app.setGlobalPrefix("api");

  // Test app memakai ValidationPipe yang sama dengan runtime agar kontrak DTO tervalidasi di E2E.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  return app;
}

export const testUser = {
  sub: "user-1",
  companyId: "company-1",
  employeeId: "employee-1",
  roles: ["SUPER_ADMIN"],
  permissions: [
    "employee.read",
    "employee.create",
    "employee.update",
    "employee.delete",
    "attendance.read",
    "attendance.create",
    "leave.read",
    "leave.create",
    "leave.approve",
    "payroll.read",
    "payroll.generate"
  ]
};

export const allowAuthenticatedRequest = {
  canActivate: (context: { switchToHttp: () => { getRequest: () => { user?: typeof testUser } } }) => {
    context.switchToHttp().getRequest().user = testUser;
    return true;
  }
};
