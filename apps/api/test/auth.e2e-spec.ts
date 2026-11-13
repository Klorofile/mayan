import { Test } from "@nestjs/testing";
import request from "supertest";
import { AuthController } from "../src/features/auth/auth.controller";
import { AuthService } from "../src/features/auth/auth.service";
import { configureTestApp } from "./test-app";

describe("AuthController (e2e)", () => {
  it("registers admin and logs in using email/password", async () => {
    const authService = {
      registerAdmin: jest.fn().mockResolvedValue({ id: "user-1", email: "admin@hrispro.com" }),
      login: jest.fn().mockResolvedValue({ accessToken: "access-token", refreshToken: "refresh-token" }),
      refresh: jest.fn()
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compile();
    const app = configureTestApp(moduleRef.createNestApplication());
    await app.init();

    await request(app.getHttpServer())
      .post("/api/auth/register-admin")
      .send({ companyCode: "MAYAN", companyName: "MAYAN", fullName: "Admin MAYAN", email: "admin@hrispro.com", password: "Admin123!" })
      .expect(201)
      .expect(({ body }) => expect(body.email).toBe("admin@hrispro.com"));

    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "admin@hrispro.com", password: "Admin123!" })
      .expect(201)
      .expect(({ body }) => expect(body.accessToken).toBe("access-token"));

    await app.close();
  });
});
