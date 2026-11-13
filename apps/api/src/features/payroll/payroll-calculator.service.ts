import { Injectable, NotFoundException } from "@nestjs/common";
import { Employee, EmployeeSalary, EmployeeSalaryComponent, Prisma, SalaryComponent, SalaryComponentType } from "@prisma/client";
import { PrismaService } from "../../infra/prisma/prisma.service";

type ComponentWithMaster = EmployeeSalaryComponent & {
  salaryComponent: SalaryComponent;
};

export type PayrollCalculationResult = {
  employee: Employee;
  basicSalary: Prisma.Decimal;
  allowance: Prisma.Decimal;
  overtime: Prisma.Decimal;
  deduction: Prisma.Decimal;
  tax: Prisma.Decimal;
  grossPay: Prisma.Decimal;
  totalDeduction: Prisma.Decimal;
  netPay: Prisma.Decimal;
  components: {
    salaryComponentId: string;
    componentCode: string;
    componentName: string;
    type: SalaryComponentType;
    amount: Prisma.Decimal;
  }[];
};

@Injectable()
export class PayrollCalculatorService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateEmployee(companyId: string, employeeId: string, period: { startDate: Date; endDate: Date }) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId, deletedAt: null, status: { in: ["ACTIVE", "PROBATION"] } }
    });
    if (!employee) throw new NotFoundException("Active employee not found");

    const salary = await this.getActiveSalary(companyId, employeeId, period);
    const assignedComponents = await this.getActiveComponents(companyId, employeeId, period);

    return this.calculate(employee, salary, assignedComponents);
  }

  private calculate(employee: Employee, salary: EmployeeSalary, assignedComponents: ComponentWithMaster[]): PayrollCalculationResult {
    const basicSalary = new Prisma.Decimal(salary.baseSalary);
    let allowance = new Prisma.Decimal(0);
    let overtime = new Prisma.Decimal(0);
    let deduction = new Prisma.Decimal(0);
    let tax = new Prisma.Decimal(0);

    const components = assignedComponents.map((employeeComponent) => {
      const amount = new Prisma.Decimal(employeeComponent.amount);
      const code = employeeComponent.salaryComponent.code.toUpperCase();

      // Component grouping is code-aware so OVERTIME can remain an earning component while reported separately.
      if (code.includes("BASIC")) {
        // Basic salary is already sourced from EmployeeSalary history, so the master component is snapshotted only.
      } else if (code.includes("OVERTIME")) {
        overtime = overtime.plus(amount);
      } else if (employeeComponent.salaryComponent.type === "EARNING" || employeeComponent.salaryComponent.type === "BENEFIT") {
        allowance = allowance.plus(amount);
      } else if (employeeComponent.salaryComponent.type === "DEDUCTION") {
        deduction = deduction.plus(amount);
      } else if (employeeComponent.salaryComponent.type === "TAX") {
        tax = tax.plus(amount);
      }

      return {
        salaryComponentId: employeeComponent.salaryComponentId,
        componentCode: employeeComponent.salaryComponent.code,
        componentName: employeeComponent.salaryComponent.name,
        type: employeeComponent.salaryComponent.type,
        amount
      };
    });

    const grossPay = basicSalary.plus(allowance).plus(overtime);
    const totalDeduction = deduction.plus(tax);
    const netPay = grossPay.minus(totalDeduction);

    return { employee, basicSalary, allowance, overtime, deduction, tax, grossPay, totalDeduction, netPay, components };
  }

  private async getActiveSalary(companyId: string, employeeId: string, period: { startDate: Date; endDate: Date }) {
    const salary = await this.prisma.employeeSalary.findFirst({
      where: {
        companyId,
        employeeId,
        deletedAt: null,
        status: "ACTIVE",
        effectiveFrom: { lte: period.endDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: period.startDate } }]
      },
      orderBy: { effectiveFrom: "desc" }
    });

    if (!salary) throw new NotFoundException("Active salary history not found for employee");
    return salary;
  }

  private getActiveComponents(companyId: string, employeeId: string, period: { startDate: Date; endDate: Date }) {
    return this.prisma.employeeSalaryComponent.findMany({
      where: {
        companyId,
        employeeId,
        deletedAt: null,
        status: "ACTIVE",
        effectiveFrom: { lte: period.endDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: period.startDate } }]
      },
      include: { salaryComponent: true },
      orderBy: { createdAt: "asc" }
    });
  }
}
