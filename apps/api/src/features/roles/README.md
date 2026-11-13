# Roles Module

Module `roles` mengelola role untuk authorization.

## Responsibilities

- List role dalam company.
- Create custom role.
- Assign permission ke role.

## Main Endpoints

- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/:id/permissions`

## Security

- Role dikelola per company.
- `SUPER_ADMIN` dapat membuat role dan mengganti permission.
- Assignment permission memakai replace-all pattern agar idempotent dan mudah dikontrol dari UI admin.

## Important Files

- `roles.controller.ts` — REST endpoint role management.
- `roles.service.ts` — role query dan permission assignment.
- `dto/create-role.dto.ts` — validasi create role.
- `dto/assign-permissions.dto.ts` — validasi assignment permission.
