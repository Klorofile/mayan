# Payroll Module

Module `payroll` menangani master salary component, assignment component ke employee, payroll period, payroll generation, CSV export, dan payslip data.

## REST Prefix

```txt
/api/payrolls
```

## Endpoints

### Salary Component

- `GET /api/payrolls/salary-components` — list master salary component.
- `POST /api/payrolls/salary-components` — create salary component.
- `POST /api/payrolls/employees/:employeeId/components` — assign component ke employee.

### Payroll Period

- `GET /api/payrolls/periods` — list payroll period.
- `POST /api/payrolls/periods` — create payroll period.
- `POST /api/payrolls/periods/:periodId/generate` — generate payroll untuk semua employee aktif atau satu employee.
- `POST /api/payrolls/periods/:periodId/lock` — lock payroll period.
- `GET /api/payrolls/periods/:periodId/export.csv` — export payroll summary CSV.

### Payroll

- `GET /api/payrolls` — list payroll dengan pagination/filter.
- `GET /api/payrolls/:id` — payroll detail.
- `GET /api/payrolls/:id/components` — payroll component snapshot detail.
- `GET /api/payrolls/:id/payslip` — payslip data.

## Calculation Rules

- Payroll tidak bisa di-generate ulang jika period berstatus `LOCKED`.
- Payroll calculation dipisahkan ke `PayrollCalculatorService`.
- Semua angka memakai `Prisma.Decimal`.
- Basic salary diambil dari `EmployeeSalary` aktif pada periode payroll.
- Allowance, overtime, deduction, dan tax dihitung dari `EmployeeSalaryComponent` aktif.
- Component dengan kode mengandung `OVERTIME` dipisahkan ke bucket overtime.
- Snapshot `componentCode`, `componentName`, `type`, dan `amount` disimpan ke `payroll_components`.

## Formula

```txt
grossPay = basicSalary + allowance + overtime
totalDeduction = deduction + tax
netPay = grossPay - totalDeduction
```

## Important Files

- `payroll.controller.ts` — REST endpoint payroll.
- `payroll.service.ts` — orchestration period, generation, CSV, payslip.
- `payroll-calculator.service.ts` — payroll calculation engine.
- `dto/create-salary-component.dto.ts` — master component payload.
- `dto/assign-employee-salary-component.dto.ts` — employee component assignment payload.
- `dto/create-payroll-period.dto.ts` — payroll period payload.
