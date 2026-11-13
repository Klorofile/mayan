# Payroll Frontend Feature

Feature ini berisi integration layer dan komponen UI Payroll.

## API Integration

- `GET /api/payrolls`
- `GET /api/payrolls/:id`
- `GET /api/payrolls/:id/payslip`
- `GET /api/payrolls/periods`
- `POST /api/payrolls/periods`
- `POST /api/payrolls/periods/:periodId/generate`
- `POST /api/payrolls/periods/:periodId/lock`
- `GET /api/payrolls/periods/:periodId/export.csv`
- `GET /api/payrolls/salary-components`
- `POST /api/payrolls/salary-components`

## Components

- `payroll-summary-cards.tsx` — summary gross, deduction, net pay.
- `payroll-table.tsx` — employee payroll list.
- `payroll-period-form.tsx` — create payroll period.
- `salary-component-form.tsx` — create salary component.
- `payroll-status-badge.tsx` — status badge period/payroll.

## Authorization

Payroll UI dibungkus `RoleGuard` dan hanya tampil untuk role:

- `SUPER_ADMIN`
- `HR_ADMIN`

Backend RBAC tetap menjadi sumber kebenaran keamanan.
