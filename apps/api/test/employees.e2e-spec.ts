import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAuthGuard } from "../src/features/auth/guards/jwt-auth.guard";
import { EmployeesController } from "../src/features/employees/employees.controller";
import { EmployeesService } from "../src/features/employees/employees.service";
import { PermissionsGuard } from "../src/features/rbac/guards/permissions.guard";
import { allowAuthenticatedRequest, configureTestApp } from "./test-app";

describe("EmployeesController (e2e)", () => {
  it("covers employee CRUD HTTP contract", async () => {
    const employeesService = {
      create: jest.fn().mockResolvedValue({ id: "employee-1", employeeNumber: "MYN-9999" }),
      list: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }),
      detail: jest.fn().mockResolvedValue({ id: "employee-1", fullName: "QA Employee" }),
      update: jest.fn().mockResolvedValue({ id: "employee-1", fullName: "QA Employee Updated" }),
      softDelete: jest.fn().mockResolvedValue({ id: "employee-1", deletedAt: new Date().toISOString() })
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: employeesService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAuthenticatedRequest)
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();
    const app = configureTestApp(moduleRef.createNestApplication());
    await app.init();

    const payload = { employeeNumber: "MYN-9999", fullName: "QA Employee", email: "qa@mayan.test", hireDate: "2026-05-01" };
    await request(app.getHttpServer()).post("/api/employees").send(payload).expect(201);
    await request(app.getHttpServer()).get("/api/employees?page=1&limit=10").expect(200);
    await request(app.getHttpServer()).get("/api/employees/employee-1").expect(200);
    await request(app.getHttpServer()).patch("/api/employees/employee-1").send({ fullName: "QA Employee Updated" }).expect(200);
    await request(app.getHttpServer()).delete("/api/employees/employee-1").expect(200);

    await app.close();
  });
});
