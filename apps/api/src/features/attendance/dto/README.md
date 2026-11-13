# Attendance DTOs

DTO folder ini berisi request contract untuk Attendance Module.

## Files

- `clock.dto.ts` — payload clock-in dan clock-out, termasuk GPS latitude/longitude.
- `list-attendance-query.dto.ts` — pagination, date range, employee, dan status filter.
- `attendance-report-query.dto.ts` — query report by date range.
- `create-attendance-correction.dto.ts` — request perubahan clock-in/clock-out.
- `approve-attendance-correction.dto.ts` — approval/rejection note.

Semua DTO menggunakan `class-validator` dan diproses oleh global `ValidationPipe`.
