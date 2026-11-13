import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infra/prisma/prisma.service";
import { AssignEmployeeSalaryComponentDto } from "./dto/assign-employee-salary-component.dto";
import { CreatePayrollPeriodDto } from "./dto/create-payroll-period.dto";
import { CreateSalaryComponentDto } from "./dto/create-salary-component.dto";
import { GeneratePayrollDto } from "./dto/generate-payroll.dto";
import { PayrollQueryDto } from "./dto/payroll-query.dto";
import { PayrollCalculatorService } from "./payroll-calculator.service";

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: PayrollCalculatorService
  ) {}

  listSalaryComponents(companyId: string) {
    return this.prisma.salaryComponent.findMany({
      where: { companyId, deletedAt: null },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
  }

  createSalaryComponent(companyId: string, dto: CreateSalaryComponentDto) {
    return this.prisma.salaryComponent.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        calculationType: dto.calculationType ?? "FIXED",
        defaultAmount: dto.defaultAmount ?? 0,
        isTaxable: dto.isTaxable ?? false
      }
    });
  }

  async assignComponent(companyId: string, employeeId: string, dto: AssignEmployeeSalaryComponentDto) {
    await this.ensureEmployee(companyId, employeeId);
    await this.ensureSalaryComponent(companyId, dto.salaryComponentId);

    return this.prisma.employeeSalaryComponent.create({
      data: {
        companyId,
        employeeId,
        salaryComponentId: dto.salaryComponentId,
        amount: dto.amount,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
        status: dto.status ?? "ACTIVE"
      },
      include: { salaryComponent: true }
    });
  }

  listPeriods(companyId: string) {
    return this.prisma.payrollPeriod.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { startDate: "desc" }
    });
  }

  createPeriod(companyId: string, dto: CreatePayrollPeriodDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) throw new BadRequestException("endDate must be greater than or equal to startDate");

    return this.prisma.payrollPeriod.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        startDate,
        endDate,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined
      }
    });
  }

  async lockPeriod(companyId: string, periodId: string) {
    const period = await this.findPeriodOrThrow(companyId, periodId);
    if (period.status === "LOCKED") throw new ConflictException("Payroll period is already locked");

    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: "LOCKED" }
    });
  }

  async list(companyId: string, query: PayrollQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.PayrollWhereInput = {
      companyId,
      deletedAt: null,
      payrollPeriodId: query.payrollPeriodId,
      employeeId: query.employeeId,
      status: query.status
    };

    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { employee: true, payrollPeriod: true, components: true },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.payroll.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async detail(companyId: string, id: string) {
    return this.findPayrollOrThrow(companyId, id);
  }

  async componentDetail(companyId: string, id: string) {
    const payroll = await this.findPayrollOrThrow(companyId, id);
    return payroll.components;
  }

  async generate(companyId: string, periodId: string, dto: GeneratePayrollDto) {
    const period = await this.findPeriodOrThrow(companyId, periodId);
    if (period.status === "LOCKED") {
      throw new ConflictException("Payroll cannot be generated because period is LOCKED");
    }

    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { in: ["ACTIVE", "PROBATION"] },
        id: dto.employeeId
      },
      orderBy: { fullName: "asc" }
    });

    if (!employees.length) throw new NotFoundException("No active employees found for payroll generation");

    const payrolls = [];
    for (const employee of employees) {
      const calculation = await this.calculator.calculateEmployee(companyId, employee.id, period);

      // Re-generation is allowed only while the period is open; old snapshot components are replaced atomically.
      const payroll = await this.prisma.$transaction(async (tx) => {
        const savedPayroll = await tx.payroll.upsert({
          where: { employeeId_payrollPeriodId: { employeeId: employee.id, payrollPeriodId: period.id } },
          create: {
            companyId,
            employeeId: employee.id,
            payrollPeriodId: period.id,
            basicSalary: calculation.basicSalary,
            allowance: calculation.allowance,
            overtime: calculation.overtime,
            deduction: calculation.deduction,
            tax: calculation.tax,
            grossPay: calculation.grossPay,
            totalDeduction: calculation.totalDeduction,
            netPay: calculation.netPay,
            status: "CALCULATED"
          },
          update: {
            basicSalary: calculation.basicSalary,
            allowance: calculation.allowance,
            overtime: calculation.overtime,
            deduction: calculation.deduction,
            tax: calculation.tax,
            grossPay: calculation.grossPay,
            totalDeduction: calculation.totalDeduction,
            netPay: calculation.netPay,
            status: "CALCULATED"
          }
        });

        await tx.payrollComponent.deleteMany({ where: { payrollId: savedPayroll.id } });
        await tx.payrollComponent.createMany({
          data: calculation.components.map((component) => ({
            companyId,
            payrollId: savedPayroll.id,
            salaryComponentId: component.salaryComponentId,
            componentCode: component.componentCode,
            componentName: component.componentName,
            type: component.type,
            amount: component.amount
          }))
        });

        return tx.payroll.findUniqueOrThrow({
          where: { id: savedPayroll.id },
          include: { employee: true, payrollPeriod: true, components: true }
        });
      });

      payrolls.push(payroll);
    }

    await this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { status: "PROCESSED" }
    });

    return payrolls;
  }

  async exportSummaryCsv(companyId: string, periodId: string) {
    const period = await this.findPeriodOrThrow(companyId, periodId);
    const payrolls = await this.prisma.payroll.findMany({
      where: { companyId, payrollPeriodId: period.id, deletedAt: null },
      include: { employee: true },
      orderBy: { employee: { fullName: "asc" } }
    });

    const rows = [
      ["Employee Number", "Employee Name", "Basic Salary", "Allowance", "Overtime", "Deduction", "Tax", "Gross Pay", "Net Pay"],
      ...payrolls.map((payroll) => [
        payroll.employee.employeeNumber,
        payroll.employee.fullName,
        payroll.basicSalary.toString(),
        payroll.allowance.toString(),
        payroll.overtime.toString(),
        payroll.deduction.toString(),
        payroll.tax.toString(),
        payroll.grossPay.toString(),
        payroll.netPay.toString()
      ])
    ];

    return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  }

  async payslip(companyId: string, id: string) {
    const payroll = await this.findPayrollOrThrow(companyId, id);

    return {
      employee: {
        id: payroll.employee.id,
        employeeNumber: payroll.employee.employeeNumber,
        fullName: payroll.employee.fullName,
        email: payroll.employee.email
      },
      period: payroll.payrollPeriod,
      summary: {
        basicSalary: payroll.basicSalary,
        allowance: payroll.allowance,
        overtime: payroll.overtime,
        deduction: payroll.deduction,
        tax: payroll.tax,
        grossPay: payroll.grossPay,
        netPay: payroll.netPay
      },
      components: payroll.components
    };
  }

  private async ensureEmployee(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId, deletedAt: null } });
    if (!employee) throw new NotFoundException("Employee not found");
  }

  private async ensureSalaryComponent(companyId: string, salaryComponentId: string) {
    const component = await this.prisma.salaryComponent.findFirst({
      where: { id: salaryComponentId, companyId, deletedAt: null }
    });
    if (!component) throw new NotFoundException("Salary component not found");
  }

  private async findPeriodOrThrow(companyId: string, periodId: string) {
    const period = await this.prisma.payrollPeriod.findFirst({ where: { id: periodId, companyId, deletedAt: null } });
    if (!period) throw new NotFoundException("Payroll period not found");
    return period;
  }

  private async findPayrollOrThrow(companyId: string, id: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { employee: true, payrollPeriod: true, components: true }
    });
    if (!payroll) throw new NotFoundException("Payroll not found");
    return payroll;
  }
}
