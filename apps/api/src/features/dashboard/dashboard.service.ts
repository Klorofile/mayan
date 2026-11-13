import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infra/prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(companyId: string) {
    const todayStart = this.startOfDay(new Date());
    const todayEnd = this.endOfDay(new Date());
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 6);
    const contractEndThreshold = new Date(todayStart);
    contractEndThreshold.setDate(todayStart.getDate() + 30);

    const [
      totalEmployees,
      todayAttendance,
      activeLeaves,
      payrollAggregate,
      latestLeaveRequests,
      employeesByDepartment,
      employeesByLocation,
      payrollReminder,
      expiringContracts
    ] = await Promise.all([
      this.prisma.employee.count({ where: { companyId, deletedAt: null, status: { in: ["ACTIVE", "PROBATION"] } } }),
      this.prisma.attendance.count({ where: { companyId, deletedAt: null, attendanceDate: { gte: todayStart, lte: todayEnd } } }),
      this.prisma.leaveRequest.count({
        where: { companyId, deletedAt: null, status: "APPROVED", startDate: { lte: todayEnd }, endDate: { gte: todayStart } }
      }),
      this.prisma.payroll.aggregate({
        where: { companyId, deletedAt: null, payrollPeriod: { startDate: { gte: monthStart }, endDate: { lte: monthEnd } } },
        _sum: { netPay: true }
      }),
      this.prisma.leaveRequest.findMany({
        where: { companyId, deletedAt: null },
        include: { employee: true, leaveType: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      this.prisma.employee.groupBy({
        by: ["departmentId"],
        where: { companyId, deletedAt: null },
        _count: { _all: true }
      }),
      this.prisma.employee.groupBy({
        by: ["branchId"],
        where: { companyId, deletedAt: null },
        _count: { _all: true }
      }),
      this.prisma.payrollPeriod.findFirst({
        where: { companyId, deletedAt: null, status: { in: ["OPEN", "PROCESSED"] } },
        orderBy: { paymentDate: "asc" }
      }),
      this.prisma.employeeContract.findMany({
        where: { companyId, deletedAt: null, endDate: { gte: todayStart, lte: contractEndThreshold }, status: "ACTIVE" },
        include: { employee: true },
        orderBy: { endDate: "asc" },
        take: 8
      })
    ]);

    const [weeklyAttendance, departmentDistribution, locationDistribution] = await Promise.all([
      this.buildWeeklyAttendance(companyId, weekStart, todayEnd),
      this.mapDepartmentDistribution(companyId, employeesByDepartment),
      this.mapLocationDistribution(companyId, employeesByLocation)
    ]);

    return {
      totals: {
        totalEmployees,
        todayAttendance,
        activeLeaves,
        currentMonthPayroll: payrollAggregate._sum.netPay ?? new Prisma.Decimal(0)
      },
      weeklyAttendance,
      latestLeaveRequests: latestLeaveRequests.map((leave) => ({
        id: leave.id,
        employeeName: leave.employee.fullName,
        leaveType: leave.leaveType.name,
        startDate: leave.startDate,
        endDate: leave.endDate,
        status: leave.status
      })),
      employeesByDepartment: departmentDistribution,
      employeesByLocation: locationDistribution,
      payrollReminder: payrollReminder
        ? {
            id: payrollReminder.id,
            name: payrollReminder.name,
            status: payrollReminder.status,
            paymentDate: payrollReminder.paymentDate
          }
        : null,
      expiringContracts: expiringContracts.map((contract) => ({
        id: contract.id,
        employeeName: contract.employee.fullName,
        contractNumber: contract.contractNumber,
        endDate: contract.endDate
      }))
    };
  }

  private async buildWeeklyAttendance(companyId: string, startDate: Date, endDate: Date) {
    const records = await this.prisma.attendance.groupBy({
      by: ["attendanceDate"],
      where: { companyId, deletedAt: null, attendanceDate: { gte: startDate, lte: endDate } },
      _count: { _all: true }
    });

    // Fill missing days with zero so the chart axis remains stable even without attendance records.
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const count = records.find((record) => this.sameDay(record.attendanceDate, date))?._count._all ?? 0;
      return {
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        attendance: count
      };
    });
  }

  private async mapDepartmentDistribution(
    companyId: string,
    grouped: { departmentId: string | null; _count: { _all: number } }[]
  ) {
    const departments = await this.prisma.department.findMany({
      where: { companyId, id: { in: grouped.map((item) => item.departmentId).filter(Boolean) as string[] } }
    });
    return grouped.map((item) => ({
      name: departments.find((department) => department.id === item.departmentId)?.name ?? "Unassigned",
      value: item._count._all
    }));
  }

  private async mapLocationDistribution(companyId: string, grouped: { branchId: string | null; _count: { _all: number } }[]) {
    const branches = await this.prisma.branch.findMany({
      where: { companyId, id: { in: grouped.map((item) => item.branchId).filter(Boolean) as string[] } }
    });
    return grouped.map((item) => ({
      name: branches.find((branch) => branch.id === item.branchId)?.name ?? "Unassigned",
      value: item._count._all
    }));
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

  private sameDay(first: Date, second: Date) {
    return first.toISOString().slice(0, 10) === second.toISOString().slice(0, 10);
  }
}
