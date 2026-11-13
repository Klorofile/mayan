import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AttendanceModule } from "./features/attendance/attendance.module";
import { AuthModule } from "./features/auth/auth.module";
import { DashboardModule } from "./features/dashboard/dashboard.module";
import { EmployeesModule } from "./features/employees/employees.module";
import { LeaveModule } from "./features/leave/leave.module";
import { PayrollModule } from "./features/payroll/payroll.module";
import { PermissionsModule } from "./features/permissions/permissions.module";
import { RbacModule } from "./features/rbac/rbac.module";
import { RolesModule } from "./features/roles/roles.module";
import { UsersModule } from "./features/users/users.module";
import { PrismaModule } from "./infra/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    RbacModule,
    DashboardModule,
    EmployeesModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule
  ]
})
export class AppModule {}
