# Leave DTOs

DTO folder ini berisi kontrak request Leave Management.

## Files

- `create-leave-type.dto.ts` — validasi create master leave type.
- `update-leave-type.dto.ts` — partial update leave type.
- `upsert-leave-balance.dto.ts` — create/update saldo cuti employee per year.
- `leave-balance-query.dto.ts` — filter balance by employee, type, year.
- `create-leave-request.dto.ts` — apply leave dengan optional `attachmentUrl`.
- `leave-query.dto.ts` — pagination dan filter leave request.
- `leave-report-query.dto.ts` — date range untuk calendar/report.
- `leave-action.dto.ts` — note untuk approve/reject/cancel.

Semua DTO divalidasi oleh global `ValidationPipe` sebelum masuk ke service.
