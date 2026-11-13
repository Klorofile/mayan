# Leave Frontend Feature

Feature ini berisi integration layer dan komponen Leave Management.

## API Integration

Endpoint backend:

- `GET /api/leaves/types`
- `GET /api/leaves/balances`
- `GET /api/leaves`
- `POST /api/leaves`
- `PATCH /api/leaves/:id/manager-approve`
- `PATCH /api/leaves/:id/hr-approve`
- `PATCH /api/leaves/:id/reject`
- `PATCH /api/leaves/:id/cancel`
- `GET /api/leaves/calendar`

## Components

- `apply-leave-form.tsx` — form apply leave dengan leave type, date range, reason, attachment URL.
- `leave-balance-cards.tsx` — card saldo cuti.
- `leave-request-table.tsx` — table request dan action cancel.
- `leave-status-badge.tsx` — status badge pending/approved/rejected/cancelled.
- `api.ts` — TanStack Query friendly API functions.

## Notes

Backend bertanggung jawab untuk validasi saldo, overlap tanggal, dan mutasi saldo saat approval/cancel.
