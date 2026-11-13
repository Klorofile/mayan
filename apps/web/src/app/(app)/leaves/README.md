# Leave Management Pages

Route group ini berisi halaman Leave Management.

## Pages

- `/leaves` — balance cards, leave request table, filter status/date.
- `/leaves/apply` — apply leave form.
- `/leaves/approval` — manager/HR approval dan reject action.
- `/leaves/calendar` — calendar view sederhana.

## Data Fetching

- Semua request memakai TanStack Query.
- Query utama:
  - `["leaves", filters]`
  - `["leave-balances"]`
  - `["leave-types"]`
  - `["leave-calendar", startDate, endDate]`
- Setelah apply/approve/reject/cancel, query `leaves` dan `leave-balances` di-invalidate.
