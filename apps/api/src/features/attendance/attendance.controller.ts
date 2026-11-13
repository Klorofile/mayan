import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { JwtUser } from "../auth/types/jwt-user";
import { Permissions } from "../rbac/decorators/permissions.decorator";
import { PermissionsGuard } from "../rbac/guards/permissions.guard";
import { AttendanceService } from "./attendance.service";
import { ApproveAttendanceCorrectionDto } from "./dto/approve-attendance-correction.dto";
import { AttendanceReportQueryDto } from "./dto/attendance-report-query.dto";
import { ClockDto } from "./dto/clock.dto";
import { CreateAttendanceCorrectionDto } from "./dto/create-attendance-correction.dto";
import { ListAttendanceQueryDto } from "./dto/list-attendance-query.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("attendances")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Permissions("attendance.read")
  list(@CurrentUser() user: JwtUser, @Query() query: ListAttendanceQueryDto) {
    return this.attendanceService.list(user.companyId, query);
  }

  @Get("report")
  @Permissions("attendance.read")
  report(@CurrentUser() user: JwtUser, @Query() query: AttendanceReportQueryDto) {
    return this.attendanceService.report(user.companyId, query);
  }

  @Get(":id")
  @Permissions("attendance.read")
  detail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.attendanceService.detail(user.companyId, id);
  }

  @Post("clock-in")
  @Permissions("attendance.create")
  clockIn(@CurrentUser() user: JwtUser, @Body() dto: ClockDto) {
    return this.attendanceService.clockIn({ userId: user.sub, companyId: user.companyId, employeeId: user.employeeId }, dto);
  }

  @Post("clock-out")
  @Permissions("attendance.create")
  clockOut(@CurrentUser() user: JwtUser, @Body() dto: ClockDto) {
    return this.attendanceService.clockOut({ userId: user.sub, companyId: user.companyId, employeeId: user.employeeId }, dto);
  }

  @Post("corrections")
  @Permissions("attendance.create")
  requestCorrection(@CurrentUser() user: JwtUser, @Body() dto: CreateAttendanceCorrectionDto) {
    return this.attendanceService.requestCorrection(
      { userId: user.sub, companyId: user.companyId, employeeId: user.employeeId },
      dto
    );
  }

  @Patch("corrections/:id/approve")
  @Permissions("leave.approve")
  approveCorrection(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: ApproveAttendanceCorrectionDto) {
    return this.attendanceService.approveCorrection(user.companyId, id, dto);
  }

  @Patch("corrections/:id/reject")
  @Permissions("leave.approve")
  rejectCorrection(@CurrentUser() user: JwtUser, @Param("id") id: string, @Body() dto: ApproveAttendanceCorrectionDto) {
    return this.attendanceService.rejectCorrection(user.companyId, id, dto);
  }
}
