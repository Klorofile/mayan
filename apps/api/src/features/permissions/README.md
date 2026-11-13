# Permissions Module

Module `permissions` mengelola permission granular untuk RBAC.

## Responsibilities

- List permission dalam company.
- Create custom permission.
- Menyimpan permission dalam format `resource.action`, misalnya `employee.read`.

## Main Endpoints

- `GET /api/permissions`
- `POST /api/permissions`

## Security

- Permission selalu scoped by `companyId`.
- Hanya role berwenang seperti `SUPER_ADMIN` yang dapat membuat permission baru.

## Important Files

- `permissions.controller.ts` — REST endpoint permission management.
- `permissions.service.ts` — permission query dan create permission.
- `dto/create-permission.dto.ts` — validasi payload permission.
