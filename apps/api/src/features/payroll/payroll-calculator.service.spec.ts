import { NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PayrollCalculatorService } from "./payroll-calculator.service";

const employee = {
  id: "employee-1",
  companyId: "company-1",
  employeeNumber: "MYN-0001",
  email: "employee@mayan.test",
  fullName: "MAYAN Employee",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
};

describe("PayrollCalculatorService", () => {
  it("calculates payroll totals from active salary components", async () => {
    const prisma = {
      employee: { findFirst: jest.fn().mockResolvedValue(employee) },
      employeeSalary: {
        findFirst: jest.fn().mockResolvedValue({ baseSalary: new Prisma.Decimal(5_000_000) })
      },
      employeeSalaryComponent: {
        findMany: jest.fn().mockResolvedValue([
          component("transport", "Transport Allowance", "EARNING", 750_000),
          component("basic", "Basic Salary", "EARNING", 5_000_000),
          component("meal", "Meal Allowance", "BENEFIT", 650_000),
          component("bpjs", "BPJS Deduction", "DEDUCTION", 250_000),
          component("tax", "PPh21", "TAX", 300_000)
        ])
      }
    };
    const service = new PayrollCalculatorService(prisma as never);

    const result = await service.calculateEmployee("company-1", "employee-1", {
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-31")
    });

    expect(result.grossPay.toNumber()).toBe(6_400_000);
    expect(result.totalDeduction.toNumber()).toBe(550_000);
    expect(result.netPay.toNumber()).toBe(5_850_000);
  });

  it("throws clear error when employee is not active in the company", async () => {
    const service = new PayrollCalculatorService({
      employee: { findFirst: jest.fn().mockResolvedValue(null) }
    } as never);

    await expect(
      service.calculateEmployee("company-1", "employee-404", {
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-05-31")
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function component(code: string, name: string, type: "EARNING" | "BENEFIT" | "DEDUCTION" | "TAX", amount: number) {
  return {
    salaryComponentId: `${code}-id`,
    amount: new Prisma.Decimal(amount),
    salaryComponent: { code, name, type }
  };
}
