# Employee Management Module

Module ini menangani seluruh lifecycle data karyawan dengan REST prefix `/api/employees`.

## Security

- Semua endpoint menggunakan `JwtAuthGuard`.
- Semua query data menggunakan `companyId` dari `@CurrentUser()`, bukan dari request body.
- Semua akses detail/sub-resource memakai pengecekan `companyId` agar user tidak bisa membaca data company lain.
- Create, update, dan delete membuat `AuditLog`.

## Endpoints

- `GET /api/employees` — list dengan pagination, search, dan filter.
- `POST /api/employees` — create employee.
- `GET /api/employees/:id` — detail employee.
- `PATCH /api/employees/:id` — update employee.
- `DELETE /api/employees/:id` — soft delete employee.
- `GET|POST /api/employees/:id/documents` — list/create document.
- `PATCH|DELETE /api/employees/:id/documents/:documentId` — update/delete document.
- `GET|POST /api/employees/:id/contracts` — list/create contract.
- `PATCH|DELETE /api/employees/:id/contracts/:contractId` — update/delete contract.
- `GET|POST /api/employees/:id/salaries` — salary history and new salary entry.
- `GET|POST /api/employees/:id/bank-accounts` — list/create bank account.
- `PATCH|DELETE /api/employees/:id/bank-accounts/:accountId` — update/delete bank account.

## Pagination Response

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

## Query Filter

`GET /api/employees?page=1&limit=10&search=andi&departmentId=uuid&positionId=uuid&branchId=uuid&status=ACTIVE`
