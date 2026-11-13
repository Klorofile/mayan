import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAuthGuard } from "../src/features/auth/guards/jwt-auth.guard";
import { AttendanceController } from "../src/features/attendance/attendance.controller";
import { AttendanceService } from "../src/features/attendance/attendance.service";
import { PermissionsGuard } from "../src/features/rbac/guards/permissions.guard";
import { allowAuthenticatedRequest, configureTestApp } from "./test-app";

describe("AttendanceController (e2e)", () => {
  it("clocks in and clocks out with GPS payload", async () => {
    const attendanceService = {
      clockIn: jest.fn().mockResolvedValue({ id: "attendance-1", status: "PRESENT", clockInAt: new Date().toISOString() }),
      clockOut: jest.fn().mockResolvedValue({ id: "attendance-1", workingMinutes: 480, clockOutAt: new Date().toISOString() }),
      list: jest.fn(),
      report: jest.fn(),
      detail: jest.fn()
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [{ provide: AttendanceService, useValue: attendanceService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAuthenticatedRequest)
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();
    const app = configureTestApp(moduleRef.createNestApplication());
    await app.init();

    await request(app.getHttpServer()).post("/api/attendances/clock-in").send({ latitude: -6.2, longitude: 106.816666 }).expect(201);
    await request(app.getHttpServer()).post("/api/attendances/clock-out").send({ latitude: -6.2, longitude: 106.816666 }).expect(201);

    await app.close();
  });
});
