# Payroll DTOs

DTO folder ini berisi request contract untuk Payroll Module.

## Files

- `create-salary-component.dto.ts` — create master salary component.
- `assign-employee-salary-component.dto.ts` — assign component ke employee.
- `create-payroll-period.dto.ts` — create payroll period.
- `generate-payroll.dto.ts` — optional `employeeId` untuk generate satu employee, kosong berarti semua employee aktif.
- `payroll-query.dto.ts` — pagination/filter payroll list.

Semua DTO menggunakan `class-validator` dan diproses oleh global `ValidationPipe`.
