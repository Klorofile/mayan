# Dashboard Module

Module `dashboard` menyediakan executive summary untuk halaman utama MAYAN.

## Endpoint

- `GET /api/dashboard/summary`

## Data Summary

- Total karyawan aktif/probation.
- Kehadiran hari ini.
- Cuti aktif hari ini.
- Total net payroll bulan berjalan.
- Grafik attendance 7 hari terakhir.
- Pengajuan cuti terbaru.
- Distribusi karyawan per department dan lokasi.
- Reminder payroll period open/processed.
- Kontrak aktif yang akan berakhir dalam 30 hari.

## Security

- Endpoint dilindungi `JwtAuthGuard` dan `PermissionsGuard`.
- Permission yang diperlukan: `dashboard.read`.
- Semua query wajib memakai `companyId` dari authenticated user agar data antar company tetap terisolasi.

## Important Files

- `dashboard.controller.ts` - endpoint dashboard summary.
- `dashboard.service.ts` - aggregate query dan mapping response dashboard.
