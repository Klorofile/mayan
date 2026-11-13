# API Testing

Folder ini berisi E2E HTTP contract test untuk module utama MAYAN.

## Cara Menjalankan

```bash
pnpm --filter @mayan/api test:e2e
```

## Scope

- `auth.e2e-spec.ts` - register admin dan login.
- `employees.e2e-spec.ts` - create, list, detail, update, soft delete employee.
- `attendance.e2e-spec.ts` - clock in dan clock out dengan GPS payload.
- `leave.e2e-spec.ts` - apply leave request.
- `payroll.e2e-spec.ts` - generate payroll period.

## Design

- Test memakai Supertest terhadap Nest application asli.
- Guard JWT dan permission di-override untuk module bisnis agar fokus ke kontrak endpoint.
- `ValidationPipe` tetap aktif agar payload invalid tetap terdeteksi sejak test.
