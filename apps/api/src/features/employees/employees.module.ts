import { Module } from "@nestjs/common";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { EmployeesController } from "./employees.controller";
import { EmployeesService } from "./employees.service";

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, PermissionsGuard]
})
export class EmployeesModule {}
