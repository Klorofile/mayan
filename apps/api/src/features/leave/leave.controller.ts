import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { LeaveActionDto } from "./dto/leave-action.dto";
import { LeaveBalanceQueryDto } from "./dto/leave-balance-query.dto";
import { LeaveQueryDto } from "./dto/leave-query.dto";
import { LeaveReportQueryDto } from "./dto/leave-report-query.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { UpsertLeaveBalanceDto } from "./dto/upsert-leave-balance.dto";
import { LeaveService } from "./leave.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("leaves")
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get("types")
  @Permissions("leave.read")
  listLeaveTypes(@CurrentUser() user: JwtUser) {
    return this.leaveService.listLeaveTypes(user.companyId);
  }

  @Post("types")
  @Permissions("leave.approve")
  createLeaveType(@CurrentUser() user: JwtUser, @Body() dto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(user.companyId, dto);
  }

  @Patch("types/:id")
  @Permissions("leave.approve")
  updateLeaveType(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.leaveService.updateLeaveType(user.companyId, id, dto);
  }

  @Delete("types/:id")
  @Permissions("leave.approve")
  deleteLeaveType(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.leaveService.deleteLeaveType(user.companyId, id);
  }

  @Get("balances")
  @Permissions("leave.read")
  listBalances(@CurrentUser() user: JwtUser, @Query() query: LeaveBalanceQueryDto) {
    return this.leaveService.listBalances(user.companyId, query);
  }

  @Put("balances")
  @Permissions("leave.approve")
  upsertBalance(@CurrentUser() user: JwtUser, @Body() dto: UpsertLeaveBalanceDto) {
    return this.leaveService.upsertBalance(user.companyId, dto);
  }

  @Get()
  @Permissions("leave.read")
  list(@CurrentUser() user: JwtUser, @Query() query: LeaveQueryDto) {
    return this.leaveService.list(user.companyId, query);
  }

  @Post()
  @Permissions("leave.create")
  apply(@CurrentUser() user: JwtUser, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.apply({ userId: user.sub, companyId: user.companyId, employeeId: user.employeeId }, dto);
  }

  @Get("calendar")
  @Permissions("leave.read")
  calendar(@CurrentUser() user: JwtUser, @Query() query: LeaveReportQueryDto) {
    return this.leaveService.calendar(user.companyId, query);
  }

  @Get("report")
  @Permissions("leave.read")
  report(@CurrentUser() user: JwtUser, @Query() query: LeaveReportQueryDto) {
    return this.leaveService.report(user.companyId, query);
  }

  @Patch(":id/manager-approve")
  @Permissions("leave.approve")
  managerApprove(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: LeaveActionDto) {
    return this.leaveService.managerApprove(user.companyId, id, dto);
  }

  @Patch(":id/hr-approve")
  @Permissions("leave.approve")
  hrApprove(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: LeaveActionDto) {
    return this.leaveService.hrApprove(user.companyId, id, dto);
  }

  @Patch(":id/reject")
  @Permissions("leave.approve")
  reject(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: LeaveActionDto) {
    return this.leaveService.reject(user.companyId, id, dto);
  }

  @Patch(":id/cancel")
  @Permissions("leave.create")
  cancel(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: LeaveActionDto) {
    return this.leaveService.cancel(user.companyId, id, dto);
  }
}
