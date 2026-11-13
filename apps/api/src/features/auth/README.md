# Auth Module

Module `auth` menangani authentication lifecycle untuk MAYAN.

## Responsibilities

- Register admin pertama untuk bootstrap company dan default RBAC.
- Login dengan email dan password.
- Hash password menggunakan bcrypt.
- Issue JWT access token dan refresh token.
- Refresh access token.
- Expose authenticated user lewat `GET /api/auth/me`.

## Main Endpoints

- `POST /api/auth/register-admin`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

## Important Files

- `auth.controller.ts` — REST endpoint auth.
- `auth.service.ts` — credential validation, token generation, bootstrap RBAC.
- `strategies/jwt.strategy.ts` — JWT payload validation.
- `guards/jwt-auth.guard.ts` — guard untuk authenticated user.
- `guards/roles.guard.ts` — guard untuk role-based access.
- `decorators/current-user.decorator.ts` — helper mengambil user dari JWT request.
- `decorators/roles.decorator.ts` — metadata role requirement.

## Notes

Access token dipakai untuk request harian, sedangkan refresh token dipakai untuk membuat access token baru tanpa login ulang.
