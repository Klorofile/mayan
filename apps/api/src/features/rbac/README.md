# RBAC Module

Module `rbac` berisi utilitas authorization lama/kompatibilitas untuk role dan permission.

## Responsibilities

- Menyediakan endpoint read-only untuk roles dan permissions.
- Menyediakan `Permissions` decorator dan `PermissionsGuard`.
- Menjadi compatibility layer untuk fitur yang masih import dari `features/rbac`.

## Main Endpoints

- `GET /api/rbac/roles`
- `GET /api/rbac/permissions`

## Important Files

- `decorators/permissions.decorator.ts` — decorator `@Permissions()`.
- `guards/permissions.guard.ts` — mengecek permission dari JWT payload.
- `rbac.controller.ts` — endpoint read-only role/permission.
- `rbac.service.ts` — query role dan permission.

## Notes

Module baru `roles` dan `permissions` dipakai untuk management CRUD, sementara module ini tetap berguna sebagai authorization utility.
