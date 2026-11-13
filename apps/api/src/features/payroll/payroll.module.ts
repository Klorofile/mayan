import { Module } from "@nestjs/common";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { PayrollCalculatorService } from "./payroll-calculator.service";
import { PayrollController } from "./payroll.controller";
import { PayrollService } from "./payroll.service";

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, PayrollCalculatorService, PermissionsGuard]
})
export class PayrollModule {}
