# Payroll Pages

Route group ini berisi halaman Payroll.

## Pages

- `/payroll` — payroll summary, employee list, filter, export CSV.
- `/payroll/periods` — payroll period table dan create period.
- `/payroll/generate` — generate payroll untuk semua employee aktif atau satu employee.
- `/payroll/[id]` — payroll detail, component detail, payslip preview.
- `/payroll/components` — salary component management.

## Data Fetching

Semua data memakai TanStack Query dengan cache key:

- `["payrolls", filters]`
- `["payroll-periods"]`
- `["payroll", id]`
- `["payslip", id]`
- `["salary-components"]`
