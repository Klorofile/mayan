# MAYAN API

Backend MAYAN dibangun dengan NestJS, Prisma ORM, PostgreSQL, JWT authentication, dan RBAC.

## Commands

```bash
pnpm --filter @mayan/api dev
pnpm --filter @mayan/api build
pnpm --filter @mayan/api lint
pnpm --filter @mayan/api test
pnpm --filter @mayan/api test:e2e
pnpm --filter @mayan/api seed
```

## Environment

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/mayan?schema=public"
JWT_ACCESS_SECRET="replace-with-a-long-random-access-secret"
JWT_REFRESH_SECRET="replace-with-a-long-random-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
API_PORT="4000"
CORS_ORIGIN="http://localhost:3000"
```

## Testing

- `jest.config.cjs` menjalankan unit test di `src/**/*.spec.ts`.
- `test/jest-e2e.config.cjs` menjalankan E2E test di `test/**/*.e2e-spec.ts`.
- `test/test-app.ts` menyalakan global prefix `/api` dan `ValidationPipe` agar test mirip runtime.
- E2E test memakai service mock untuk menjaga test cepat dan deterministik tanpa bergantung database lokal.

## Covered Tests

- Unit: `PayrollCalculatorService`.
- E2E: auth register/login, employee CRUD, attendance clock in/out, leave apply, payroll generate.
