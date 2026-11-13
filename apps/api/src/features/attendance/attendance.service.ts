import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AttendanceStatus, CorrectionStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { ApproveAttendanceCorrectionDto } from "./dto/approve-attendance-correction.dto";
import { AttendanceReportQueryDto } from "./dto/attendance-report-query.dto";
import { ClockDto } from "./dto/clock.dto";
import { CreateAttendanceCorrectionDto } from "./dto/create-attendance-correction.dto";
import { ListAttendanceQueryDto } from "./dto/list-attendance-query.dto";

type Actor = {
  userId: string;
  companyId: string;
  employeeId?: string;
};

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string, query: ListAttendanceQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildAttendanceWhere(companyId, query);

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { employee: { include: { branch: true, department: true, position: true } }, corrections: true },
        orderBy: [{ attendanceDate: "desc" }, { createdAt: "desc" }]
      }),
      this.prisma.attendance.count({ where })
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async detail(companyId: string, id: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { employee: { include: { branch: true, department: true, position: true } }, corrections: true }
    });

    if (!attendance) throw new NotFoundException("Attendance not found");
    return attendance;
  }

  async clockIn(actor: Actor, dto: ClockDto) {
    const employee = await this.getEmployeeForAttendance(actor, dto.employeeId);
    const attendanceDate = this.startOfDay(dto.attendanceDate ? new Date(dto.attendanceDate) : new Date());

    const existingAttendance = await this.prisma.attendance.findUnique({
      where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate } }
    });
    if (existingAttendance?.clockInAt) {
      throw new ConflictException("Employee already clocked in for this date");
    }

    this.validateGps(employee.branch, dto.latitude, dto.longitude);

    const clockInAt = new Date();
    const lateMinutes = this.calculateLateMinutes(employee.workSchedule, attendanceDate, clockInAt);
    const status: AttendanceStatus = lateMinutes > 0 ? "LATE" : "PRESENT";

    // Store attendanceDate as start-of-day so the unique rule is truly one attendance per employee per date.
    return this.prisma.attendance.create({
      data: {
        companyId: actor.companyId,
        employeeId: employee.id,
        workScheduleId: employee.workScheduleId,
        attendanceDate,
        clockInAt,
        clockInLatitude: dto.latitude,
        clockInLongitude: dto.longitude,
        lateMinutes,
        status,
        notes: dto.notes
      }
    });
  }

  async clockOut(actor: Actor, dto: ClockDto) {
    const employee = await this.getEmployeeForAttendance(actor, dto.employeeId);
    const attendanceDate = this.startOfDay(dto.attendanceDate ? new Date(dto.attendanceDate) : new Date());
    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate } }
    });

    if (!attendance?.clockInAt) {
      throw new BadRequestException("Clock out is only allowed after clock in");
    }
    if (attendance.clockOutAt) {
      throw new ConflictException("Employee already clocked out for this date");
    }

    this.validateGps(employee.branch, dto.latitude, dto.longitude);

    const clockOutAt = new Date();
    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOutAt,
        clockOutLatitude: dto.latitude,
        clockOutLongitude: dto.longitude,
        workingMinutes: this.calculateWorkingMinutes(attendance.clockInAt, clockOutAt),
        notes: dto.notes ?? attendance.notes
      }
    });
  }

  async requestCorrection(actor: Actor, dto: CreateAttendanceCorrectionDto) {
    const employee = await this.getEmployeeForAttendance(actor, dto.employeeId);
    const attendance = dto.attendanceId
      ? await this.prisma.attendance.findFirst({ where: { id: dto.attendanceId, companyId: actor.companyId, employeeId: employee.id } })
      : null;

    if (dto.attendanceId && !attendance) {
      throw new NotFoundException("Attendance not found");
    }

    return this.prisma.attendanceCorrection.create({
      data: {
        companyId: actor.companyId,
        employeeId: employee.id,
        attendanceId: attendance?.id,
        requestedClockInAt: dto.requestedClockInAt ? new Date(dto.requestedClockInAt) : undefined,
        requestedClockOutAt: dto.requestedClockOutAt ? new Date(dto.requestedClockOutAt) : undefined,
        reason: dto.reason,
        status: "PENDING"
      }
    });
  }

  async approveCorrection(companyId: string, id: string, dto: ApproveAttendanceCorrectionDto) {
    const correction = await this.findCorrectionOrThrow(companyId, id);
    if (correction.status !== "PENDING") {
      throw new ConflictException("Only pending correction can be approved");
    }

    return this.prisma.$transaction(async (tx) => {
      const attendance = correction.attendanceId
        ? await tx.attendance.findFirst({
            where: { id: correction.attendanceId, companyId },
            include: { workSchedule: true }
          })
        : null;

      if (attendance) {
        const clockInAt = correction.requestedClockInAt ?? attendance.clockInAt;
        const clockOutAt = correction.requestedClockOutAt ?? attendance.clockOutAt;
        const lateMinutes = clockInAt
          ? this.calculateLateMinutes(attendance.workSchedule, attendance.attendanceDate, clockInAt)
          : attendance.lateMinutes;

        await tx.attendance.update({
          where: { id: attendance.id },
          data: {
            clockInAt,
            clockOutAt,
            lateMinutes,
            workingMinutes: clockInAt && clockOutAt ? this.calculateWorkingMinutes(clockInAt, clockOutAt) : attendance.workingMinutes,
            status: lateMinutes > 0 ? "LATE" : "PRESENT"
          }
        });
      }

      return tx.attendanceCorrection.update({
        where: { id },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewerNote: dto.reviewerNote }
      });
    });
  }

  async rejectCorrection(companyId: string, id: string, dto: ApproveAttendanceCorrectionDto) {
    const correction = await this.findCorrectionOrThrow(companyId, id);
    if (correction.status !== "PENDING") {
      throw new ConflictException("Only pending correction can be rejected");
    }

    return this.prisma.attendanceCorrection.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewerNote: dto.reviewerNote }
    });
  }

  async report(companyId: string, query: AttendanceReportQueryDto) {
    const where = this.buildAttendanceWhere(companyId, {
      page: 1,
      limit: 100,
      startDate: query.startDate,
      endDate: query.endDate,
      employeeId: query.employeeId
    });

    const records = await this.prisma.attendance.findMany({
      where,
      include: { employee: { include: { branch: true, department: true, position: true } } },
      orderBy: [{ attendanceDate: "asc" }, { employee: { fullName: "asc" } }]
    });

    const summary = records.reduce(
      (accumulator, record) => {
        accumulator.totalRecords += 1;
        accumulator.totalLateMinutes += record.lateMinutes;
        accumulator.totalWorkingMinutes += record.workingMinutes;
        accumulator.byStatus[record.status] = (accumulator.byStatus[record.status] ?? 0) + 1;
        return accumulator;
      },
      {
        totalRecords: 0,
        totalLateMinutes: 0,
        totalWorkingMinutes: 0,
        byStatus: {} as Record<AttendanceStatus, number>
      }
    );

    return { summary, data: records };
  }

  private buildAttendanceWhere(companyId: string, query: ListAttendanceQueryDto): Prisma.AttendanceWhereInput {
    return {
      companyId,
      deletedAt: null,
      employeeId: query.employeeId,
      status: query.status,
      attendanceDate:
        query.startDate || query.endDate
          ? {
              gte: query.startDate ? this.startOfDay(new Date(query.startDate)) : undefined,
              lte: query.endDate ? this.endOfDay(new Date(query.endDate)) : undefined
            }
          : undefined
    };
  }

  private async getEmployeeForAttendance(actor: Actor, requestedEmployeeId?: string) {
    const employeeId = requestedEmployeeId ?? actor.employeeId;
    if (!employeeId) {
      throw new BadRequestException("employeeId is required for users without linked employee profile");
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId: actor.companyId, deletedAt: null },
      include: { branch: true, workSchedule: true }
    });
    if (!employee) throw new NotFoundException("Employee not found");

    if (!actor.employeeId && !requestedEmployeeId) return employee;
    if (actor.employeeId && requestedEmployeeId && actor.employeeId !== requestedEmployeeId) {
      // Admin/HR flows can still pass employeeId when their permission allows it; this check is intentionally permissive for now.
      return employee;
    }

    return employee;
  }

  private validateGps(
    branch: { latitude: Prisma.Decimal | null; longitude: Prisma.Decimal | null; radiusMeter: number } | null,
    latitude: number,
    longitude: number
  ) {
    if (!branch?.latitude || !branch.longitude) {
      throw new BadRequestException("Branch GPS location is not configured");
    }

    const distance = this.distanceInMeters(
      Number(branch.latitude),
      Number(branch.longitude),
      latitude,
      longitude
    );

    if (distance > branch.radiusMeter) {
      throw new ForbiddenException(`Location is outside allowed radius. Distance: ${Math.round(distance)} meters`);
    }
  }

  private calculateLateMinutes(workSchedule: { [key: string]: unknown } | null, attendanceDate: Date, clockInAt: Date) {
    const scheduleStart = this.getScheduleTime(workSchedule, attendanceDate, "Start");
    if (!scheduleStart) return 0;

    const expectedStart = this.mergeDateAndTime(attendanceDate, scheduleStart);
    return Math.max(0, Math.ceil((clockInAt.getTime() - expectedStart.getTime()) / 60_000));
  }

  private calculateWorkingMinutes(clockInAt: Date, clockOutAt: Date) {
    return Math.max(0, Math.floor((clockOutAt.getTime() - clockInAt.getTime()) / 60_000));
  }

  private getScheduleTime(workSchedule: { [key: string]: unknown } | null, date: Date, suffix: "Start" | "End") {
    if (!workSchedule) return null;
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const key = `${dayNames[date.getDay()]}${suffix}`;
    return typeof workSchedule[key] === "string" ? (workSchedule[key] as string) : null;
  }

  private mergeDateAndTime(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const result = new Date(date);
    result.setHours(hours || 0, minutes || 0, 0, 0);
    return result;
  }

  private async findCorrectionOrThrow(companyId: string, id: string) {
    const correction = await this.prisma.attendanceCorrection.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { attendance: true }
    });
    if (!correction) throw new NotFoundException("Attendance correction not found");
    return correction;
  }

  private startOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private endOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  private distanceInMeters(fromLatitude: number, fromLongitude: number, toLatitude: number, toLongitude: number) {
    const earthRadius = 6_371_000;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const latitudeDistance = toRadians(toLatitude - fromLatitude);
    const longitudeDistance = toRadians(toLongitude - fromLongitude);
    const fromLatitudeRad = toRadians(fromLatitude);
    const toLatitudeRad = toRadians(toLatitude);

    // Haversine formula gives reliable geofence distance for branch attendance validation.
    const haversine =
      Math.sin(latitudeDistance / 2) ** 2 +
      Math.cos(fromLatitudeRad) * Math.cos(toLatitudeRad) * Math.sin(longitudeDistance / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }
}
