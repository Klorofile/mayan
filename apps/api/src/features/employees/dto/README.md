# Employee DTOs

DTO folder ini berisi class-validator contract untuk Employee Management.

## Main DTOs

- `CreateEmployeeDto` — payload create employee, termasuk `photoUrl`.
- `UpdateEmployeeDto` — partial update employee.
- `ListEmployeesQueryDto` — pagination, search, filter department/position/branch/status.

## Sub-resource DTOs

- `CreateEmployeeDocumentDto` dan `UpdateEmployeeDocumentDto`.
- `CreateEmployeeContractDto` dan `UpdateEmployeeContractDto`.
- `CreateEmployeeSalaryDto`.
- `CreateEmployeeBankAccountDto` dan `UpdateEmployeeBankAccountDto`.

Semua validasi terjadi sebelum service dipanggil melalui global `ValidationPipe`.
