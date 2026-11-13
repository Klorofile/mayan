import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { LeaveStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { CreateLeaveRequestDto } from "./dto/create-leave-request.dto";
import { CreateLeaveTypeDto } from "./dto/create-leave-type.dto";
import { LeaveActionDto } from "./dto/leave-action.dto";
import { LeaveBalanceQueryDto } from "./dto/leave-balance-query.dto";
import { LeaveQueryDto } from "./dto/leave-query.dto";
import { LeaveReportQueryDto } from "./dto/leave-report-query.dto";
import { UpdateLeaveTypeDto } from "./dto/update-leave-type.dto";
import { UpsertLeaveBalanceDto } from "./dto/upsert-leave-balance.dto";

type Actor = {
  userId: string;
  companyId: string;
  employeeId?: string;
};

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  listLeaveTypes(companyId: string) {
    return this.prisma.leaveType.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: "asc" }
    });
  }

  createLeaveType(companyId: string, dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        annualQuotaDays: dto.annualQuotaDays,
        isPaid: dto.isPaid ?? true,
        requiresApproval: dto.requiresApproval ?? true
      }
    });
  }

  async updateLeaveType(companyId: string, id: string, dto: UpdateLeaveTypeDto) {
    await this.findLeaveTypeOrThrow(companyId, id);
    return this.prisma.leaveType.update({
      where: { id },
      data: dto
    });
  }

  async deleteLeaveType(companyId: string, id: string) {
    await this.findLeaveTypeOrThrow(companyId, id);
    return this.prisma.leaveType.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  listBalances(companyId: string, query: LeaveBalanceQueryDto) {
    return this.prisma.leaveBalance.findMany({
      where: {
        companyId,
        deletedAt: null,
        employeeId: query.employeeId,
        leaveTypeId: query.leaveTypeId,
        year: query.year
      },
      include: { employee: true, leaveType: true },
      orderBy: [{ year: "desc" }, { employee: { fullName: "asc" } }]
    });
  }

  async upsertBalance(companyId: string, dto: UpsertLeaveBalanceDto) {
    await this.ensureEmployee(companyId, dto.employeeId);
    await this.findLeaveTypeOrThrow(companyId, dto.leaveTypeId);
    const remaining = new Prisma.Decimal(dto.openingBalance).plus(dto.accrued);

    return this.prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: dto.employeeId, leaveTypeId: dto.leaveTypeId, year: dto.year } },
      create: {
        companyId,
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        year: dto.year,
        openingBalance: dto.openingBalance,
        accrued: dto.accrued,
        used: 0,
        remaining
      },
      update: {
        openingBalance: dto.openingBalance,
        accrued: dto.accrued,
        remaining
      },
      include: { employee: true, leaveType: true }
    });
  }

  async list(companyId: string, query: LeaveQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildLeaveWhere(companyId, query);

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { employee: true, leaveType: true },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.leaveRequest.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async apply(actor: Actor, dto: CreateLeaveRequestDto) {
    const employeeId = dto.employeeId ?? actor.employeeId;
    if (!employeeId) throw new BadRequestException("employeeId is required");

    const employee = await this.ensureEmployee(actor.companyId, employeeId);
    const leaveType = await this.findLeaveTypeOrThrow(actor.companyId, dto.leaveTypeId);
    const startDate = this.startOfDay(new Date(dto.startDate));
    const endDate = this.startOfDay(new Date(dto.endDate));
    if (endDate < startDate) throw new BadRequestException("endDate must be greater than or equal to startDate");

    const totalDays = this.calculateLeaveDays(startDate, endDate);
    await this.ensureNoOverlap(actor.companyId, employee.id, startDate, endDate);

    const balance = await this.getBalanceOrThrow(actor.companyId, employee.id, leaveType.id, startDate.getFullYear());
    if (new Prisma.Decimal(balance.remaining).lt(totalDays)) {
      throw new BadRequestException("Insufficient leave balance");
    }

    // Balance is checked during apply, but only deducted after final HR approval.
    return this.prisma.leaveRequest.create({
      data: {
        companyId: actor.companyId,
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        startDate,
        endDate,
        totalDays,
        reason: dto.reason,
        attachmentUrl: dto.attachmentUrl,
        status: leaveType.requiresApproval ? "PENDING" : "APPROVED",
        managerApprovedAt: leaveType.requiresApproval ? undefined : new Date(),
        hrApprovedAt: leaveType.requiresApproval ? undefined : new Date()
      },
      include: { employee: true, leaveType: true }
    });
  }

  async managerApprove(companyId: string, id: string, dto: LeaveActionDto) {
    const leave = await this.findLeaveOrThrow(companyId, id);
    if (leave.status !== "PENDING") throw new ConflictException("Only pending leave can be approved by manager");

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { managerApprovedAt: new Date(), approvalNote: dto.note },
      include: { employee: true, leaveType: true }
    });
  }

  async hrApprove(companyId: string, id: string, dto: LeaveActionDto) {
    const leave = await this.findLeaveOrThrow(companyId, id);
    if (leave.status !== "PENDING") throw new ConflictException("Only pending leave can be approved by HR");
    if (!leave.managerApprovedAt) throw new BadRequestException("Manager approval is required before HR approval");

    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: leave.employeeId,
            leaveTypeId: leave.leaveTypeId,
            year: leave.startDate.getFullYear()
          }
        }
      });
      if (!balance || new Prisma.Decimal(balance.remaining).lt(leave.totalDays)) {
        throw new BadRequestException("Insufficient leave balance");
      }

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: new Prisma.Decimal(balance.used).plus(leave.totalDays),
          remaining: new Prisma.Decimal(balance.remaining).minus(leave.totalDays)
        }
      });

      return tx.leaveRequest.update({
        where: { id },
        data: { status: "APPROVED", hrApprovedAt: new Date(), approvalNote: dto.note },
        include: { employee: true, leaveType: true }
      });
    });
  }

  async reject(companyId: string, id: string, dto: LeaveActionDto) {
    const leave = await this.findLeaveOrThrow(companyId, id);
    if (!["PENDING", "DRAFT"].includes(leave.status)) {
      throw new ConflictException("Only pending or draft leave can be rejected");
    }

    // Rejected leave never touches leave balance.
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED", rejectedAt: new Date(), approvalNote: dto.note },
      include: { employee: true, leaveType: true }
    });
  }

  async cancel(companyId: string, id: string, dto: LeaveActionDto) {
    const leave = await this.findLeaveOrThrow(companyId, id);
    if (leave.status === "CANCELLED") throw new ConflictException("Leave is already cancelled");

    return this.prisma.$transaction(async (tx) => {
      if (leave.status === "APPROVED") {
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: leave.employeeId,
              leaveTypeId: leave.leaveTypeId,
              year: leave.startDate.getFullYear()
            }
          }
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: new Prisma.Decimal(balance.used).minus(leave.totalDays),
              remaining: new Prisma.Decimal(balance.remaining).plus(leave.totalDays)
            }
          });
        }
      }

      return tx.leaveRequest.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date(), approvalNote: dto.note },
        include: { employee: true, leaveType: true }
      });
    });
  }

  calendar(companyId: string, query: LeaveReportQueryDto) {
    return this.prisma.leaveRequest.findMany({
      where: {
        companyId,
        deletedAt: null,
        employeeId: query.employeeId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: this.endOfDay(new Date(query.endDate)) },
        endDate: { gte: this.startOfDay(new Date(query.startDate)) }
      },
      include: { employee: true, leaveType: true },
      orderBy: [{ startDate: "asc" }, { employee: { fullName: "asc" } }]
    });
  }

  async report(companyId: string, query: LeaveReportQueryDto) {
    const data = await this.prisma.leaveRequest.findMany({
      where: {
        companyId,
        deletedAt: null,
        employeeId: query.employeeId,
        startDate: { lte: this.endOfDay(new Date(query.endDate)) },
        endDate: { gte: this.startOfDay(new Date(query.startDate)) }
      },
      include: { employee: true, leaveType: true },
      orderBy: { startDate: "asc" }
    });

    const summary = data.reduce(
      (accumulator, leave) => {
        accumulator.totalRequests += 1;
        accumulator.totalDays += Number(leave.totalDays);
        accumulator.byStatus[leave.status] = (accumulator.byStatus[leave.status] ?? 0) + 1;
        return accumulator;
      },
      { totalRequests: 0, totalDays: 0, byStatus: {} as Record<LeaveStatus, number> }
    );

    return { summary, data };
  }

  private buildLeaveWhere(companyId: string, query: LeaveQueryDto): Prisma.LeaveRequestWhereInput {
    return {
      companyId,
      deletedAt: null,
      employeeId: query.employeeId,
      leaveTypeId: query.leaveTypeId,
      status: query.status,
      startDate: query.endDate ? { lte: this.endOfDay(new Date(query.endDate)) } : undefined,
      endDate: query.startDate ? { gte: this.startOfDay(new Date(query.startDate)) } : undefined
    };
  }

  private async ensureNoOverlap(companyId: string, employeeId: string, startDate: Date, endDate: Date) {
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        companyId,
        employeeId,
        deletedAt: null,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate }
      }
    });

    if (overlap) throw new ConflictException("Leave request overlaps with existing pending or approved leave");
  }

  private async ensureEmployee(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId, deletedAt: null } });
    if (!employee) throw new NotFoundException("Employee not found");
    return employee;
  }

  private async findLeaveTypeOrThrow(companyId: string, id: string) {
    const leaveType = await this.prisma.leaveType.findFirst({ where: { id, companyId, deletedAt: null } });
    if (!leaveType) throw new NotFoundException("Leave type not found");
    return leaveType;
  }

  private async findLeaveOrThrow(companyId: string, id: string) {
    const leave = await this.prisma.leaveRequest.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { employee: true, leaveType: true }
    });
    if (!leave) throw new NotFoundException("Leave request not found");
    return leave;
  }

  private async getBalanceOrThrow(companyId: string, employeeId: string, leaveTypeId: string, year: number) {
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { companyId, employeeId, leaveTypeId, year, deletedAt: null }
    });
    if (!balance) throw new BadRequestException("Leave balance is not configured for this employee/year");
    return balance;
  }

  private calculateLeaveDays(startDate: Date, endDate: Date) {
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1);
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
}
