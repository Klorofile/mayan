# Employee Frontend Feature

Feature ini berisi integration layer dan UI reusable untuk Employee Management.

## API Integration

- `api.ts` memakai Axios instance dari `src/lib/api.ts`.
- TanStack Query dipakai di page untuk cache, loading state, dan invalidation.
- Endpoint backend yang dipakai:
  - `GET /api/employees`
  - `POST /api/employees`
  - `GET /api/employees/:id`
  - `PATCH /api/employees/:id`

## Components

- `employee-form.tsx` — form create/edit employee dengan React Hook Form + Zod.
- `employee-detail-tabs.tsx` — tabs detail employee: Profile, Documents, Contract, Salary, Bank Account, Attendance, Leave.
- `types.ts` — type contract frontend untuk employee response dan payload.

## Field Mapping

- `joinDate` di UI dikirim ke backend sebagai `hireDate`.
- `employmentStatus` memakai field backend `status`.
- `employeeStatus` ditampilkan sebagai field UI tambahan dan mengikuti nilai status employee.
- Department, position, dan branch masih memakai UUID master data karena endpoint master belum dibuat di frontend.
