import { Body, Controller, Get, Header, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { AssignEmployeeSalaryComponentDto } from "./dto/assign-employee-salary-component.dto";
import { CreatePayrollPeriodDto } from "./dto/create-payroll-period.dto";
import { CreateSalaryComponentDto } from "./dto/create-salary-component.dto";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";
import { PayrollQueryDto } from "./dto/payroll-query.dto";
import { PayrollService } from "./payroll.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("payrolls")
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get("salary-components")
  @Permissions("payroll.read")
  listSalaryComponents(@CurrentUser() user: JwtUser) {
    return this.payrollService.listSalaryComponents(user.companyId);
  }

  @Post("salary-components")
  @Permissions("payroll.generate")
  createSalaryComponent(@CurrentUser() user: JwtUser, @Body() dto: CreateSalaryComponentDto) {
    return this.payrollService.createSalaryComponent(user.companyId, dto);
  }

  @Post("employees/:employeeId/components")
  @Permissions("payroll.generate")
  assignComponent(
    @CurrentUser() user: JwtUser,
    @Param("employeeId") employeeId: string,
    @Body() dto: AssignEmployeeSalaryComponentDto
  ) {
    return this.payrollService.assignComponent(user.companyId, employeeId, dto);
  }

  @Get("periods")
  @Permissions("payroll.read")
  listPeriods(@CurrentUser() user: JwtUser) {
    return this.payrollService.listPeriods(user.companyId);
  }

  @Post("periods")
  @Permissions("payroll.generate")
  createPeriod(@CurrentUser() user: JwtUser, @Body() dto: CreatePayrollPeriodDto) {
    return this.payrollService.createPeriod(user.companyId, dto);
  }

  @Post("periods/:periodId/generate")
  @Permissions("payroll.generate")
  generate(@CurrentUser() user: JwtUser, @Param("periodId") periodId: string, @Body() dto: GeneratePayrollDto) {
    return this.payrollService.generate(user.companyId, periodId, dto);
  }

  @Post("periods/:periodId/lock")
  @Permissions("payroll.generate")
  lockPeriod(@CurrentUser() user: JwtUser, @Param("periodId") periodId: string) {
    return this.payrollService.lockPeriod(user.companyId, periodId);
  }

  @Get("periods/:periodId/export.csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=\"payroll-summary.csv\"")
  @Permissions("payroll.read")
  exportSummaryCsv(@CurrentUser() user: JwtUser, @Param("periodId") periodId: string) {
    return this.payrollService.exportSummaryCsv(user.companyId, periodId);
  }

  @Get()
  @Permissions("payroll.read")
  list(@CurrentUser() user: JwtUser, @Query() query: PayrollQueryDto) {
    return this.payrollService.list(user.companyId, query);
  }

  @Get(":id")
  @Permissions("payroll.read")
  detail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.payrollService.detail(user.companyId, id);
  }

  @Get(":id/components")
  @Permissions("payroll.read")
  componentDetail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.payrollService.componentDetail(user.companyId, id);
  }

  @Get(":id/payslip")
  @Permissions("payroll.read")
  payslip(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.payrollService.payslip(user.companyId, id);
  }
}
