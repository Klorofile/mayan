# Users Module

Module `users` mengelola akun login aplikasi dalam scope company.

## Responsibilities

- Create user internal company.
- List user berdasarkan `companyId` dari authenticated user.
- Get user detail tanpa mengekspos `passwordHash`.
- Assign role saat create user.

## Main Endpoints

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`

## Security

- Semua endpoint dilindungi `JwtAuthGuard`, `RolesGuard`, dan `PermissionsGuard`.
- Query selalu menggunakan `companyId` dari JWT agar tidak bisa akses user company lain.
- Response menggunakan safe select dan tidak mengembalikan password hash.

## Important Files

- `users.controller.ts` — REST endpoint user management.
- `users.service.ts` — tenant-scoped user query dan create user.
- `dto/create-user.dto.ts` — validasi payload create user.
