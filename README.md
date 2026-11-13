# MAYAN HRIS

MAYAN adalah monorepo HRIS web application bergaya Talenta untuk employee management, attendance, leave request, payroll basic, dashboard analytics, dan role-based permission.

> **Dokumentasi Lengkap:** Silakan merujuk ke berkas [DOCUMENTATION.md](./DOCUMENTATION.md) untuk arsitektur mendalam, ERD diagram database, katalog endpoint REST API, alur bisnis, dan panduan teknis enterprise.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Shadcn-style UI, React Hook Form, Zod, TanStack Query, Axios, Recharts.
- Backend: NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, RBAC.
- Testing: Jest + Supertest untuk API, Vitest + Testing Library untuk Web.
- Shared: TypeScript shared types package.

## Struktur

```txt
apps/
  api/                 NestJS REST API
    prisma/            Prisma schema, migration, seed
    src/features/      Auth, dashboard, employee, attendance, leave, payroll, RBAC modules
    test/              E2E HTTP contract tests
  web/                 Next.js App Router frontend
    src/app/           Route groups and pages
    src/components/    Layout and reusable UI components
    src/features/      Feature API adapter, form, table, chart
packages/
  shared/              Shared TypeScript types
```

## Environment

Copy contoh environment:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Default PostgreSQL lokal:

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/mayan?schema=public"
```

## Menjalankan Project

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

URL:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api`

Admin seed:

- Email: `admin@hrispro.com`
- Password: `Admin123!`

## Script Utama

- `pnpm dev` - menjalankan API dan Web secara paralel.
- `pnpm build` - build semua package/app.
- `pnpm test` - menjalankan test API dan Web.
- `pnpm lint` - type/lint check semua app.
- `pnpm prisma:migrate` - menjalankan Prisma migration.
- `pnpm prisma:seed` - mengisi data awal MAYAN.

## Testing & Quality

- API unit test: `pnpm --filter @mayan/api test:unit`
- API E2E test: `pnpm --filter @mayan/api test:e2e`
- Web test: `pnpm --filter @mayan/web test`
- Format: `pnpm format`

Test backend saat ini mencakup payroll calculator service dan HTTP E2E contract untuk auth, employee CRUD, attendance clock in/out, leave apply, dan payroll generate. Test frontend mencakup reusable component dan validasi schema form employee.

## Catatan Enterprise

- Semua endpoint bisnis memakai JWT dan permission guard.
- Query backend wajib memakai `companyId` dari authenticated user.
- Prisma seed dibuat idempotent agar aman dijalankan berulang.
- Dashboard memakai `/api/dashboard/summary` dan Recharts untuk visualisasi.
