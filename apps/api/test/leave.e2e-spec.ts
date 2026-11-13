import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAuthGuard } from "../src/features/auth/guards/jwt-auth.guard";
import { LeaveController } from "../src/features/leave/leave.controller";
import { LeaveService } from "../src/features/leave/leave.service";
import { PermissionsGuard } from "../src/features/rbac/guards/permissions.guard";
import { allowAuthenticatedRequest, configureTestApp } from "./test-app";

describe("LeaveController (e2e)", () => {
  it("applies leave request with date range and reason", async () => {
    const leaveService = {
      apply: jest.fn().mockResolvedValue({ id: "leave-1", status: "PENDING", totalDays: 2 })
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [LeaveController],
      providers: [{ provide: LeaveService, useValue: leaveService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(allowAuthenticatedRequest)
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();
    const app = configureTestApp(moduleRef.createNestApplication());
    await app.init();

    await request(app.getHttpServer())
      .post("/api/leaves")
      .send({ leaveTypeId: "b8b7ef8b-3621-45c2-b2f7-2087a5f80133", startDate: "2026-06-01", endDate: "2026-06-02", reason: "Family event leave" })
      .expect(201)
      .expect(({ body }) => expect(body.status).toBe("PENDING"));

    await app.close();
  });
});
