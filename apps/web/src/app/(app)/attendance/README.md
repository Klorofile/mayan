# Attendance Pages

Route group ini berisi halaman attendance.

## Pages

- `/attendance` — company attendance history, summary, filter tanggal, filter status.
- `/attendance/my` — clock in/out dan history user saat ini.
- `/attendance/corrections` — correction request form dan approval table manager/HR.

## Data Fetching

- Semua data memakai TanStack Query.
- Query key utama: `["attendances", filters]`.
- Setelah clock/correction/approval, query `attendances` di-invalidate agar data refresh otomatis.
