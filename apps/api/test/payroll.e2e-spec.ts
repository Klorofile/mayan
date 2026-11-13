import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAuthGuard } from "../src/features/auth/guards/jwt-auth.guard";
import { PayrollController } from "../src/features/payroll/payroll.controller";
import { PayrollService } from "../src/features/payroll/payroll.service";
import { PermissionsGuard } from "../src/features/rbac/guards/permissions.guard";
import { allowAuthenticatedRequest, configureTestApp } from "./test-app";

describe("PayrollController (e2e)", () => {
  it("generates payroll for a period", async () => {
    const payrollService = {
      generate: jest.fn().mockResolvedValue([{ id: "payroll-1", netPay: "5850000" }]),
      listSalaryComponents: jest.fn(),
      createSalaryComponent: jest.fn(),
      assignComponent: jest.fn(),
      listPeriods: jest.fn(),
      createPeriod: jest.fn(),
      lockPeriod: jest.fn(),
      exportSummaryCsv: jest.fn(),
      list: jest.fn(),
      detail: jest.fn(),
      componentDetail: jest.fn(),
      payslip: jest.fn()
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [{ provide: PayrollService, useValue: payrollService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAuthenticatedRequest)
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();
    const app = configureTestApp(moduleRef.createNestApplication());
    await app.init();

    await request(app.getHttpServer())
      .post("/api/payrolls/periods/8d9f35f3-f4a0-41bb-a4fb-a919dc5e5ed2/generate")
      .send({})
      .expect(201)
      .expect(({ body }) => expect(body[0].id).toBe("payroll-1"));

    await app.close();
  });
});
