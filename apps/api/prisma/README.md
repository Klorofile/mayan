# Prisma Seed MAYAN

Seed ini menyiapkan data awal MAYAN agar dashboard, auth, employee, leave, dan payroll bisa langsung dicoba.

## Data Yang Dibuat

- Company default `MAYAN`.
- Branch Jakarta, Bandung, Surabaya dengan koordinat GPS dan radius.
- Department HR, IT, Finance, Sales, Marketing.
- Position Staff, Senior Staff, Manager, Head.
- Role `SUPER_ADMIN`, `HR_ADMIN`, `MANAGER`, `EMPLOYEE`.
- Permission default untuk dashboard, employee, attendance, leave, payroll, role, dan permission.
- User admin `admin@hrispro.com` dengan password `Admin123!`.
- 50 employee dummy dengan schedule, salary history, salary component, dan leave balance tahun berjalan.
- Contoh employee document, contract, dan bank account untuk beberapa karyawan.
- Contoh attendance hari ini, attendance correction, leave request pending/approved/rejected, payroll result, payroll component snapshot.
- Approval workflow, approval step, approval sample, notification, dan audit log.
- Work schedule default `REGULAR_09_18`.
- Leave type Annual Leave, Sick Leave, Permission.
- Salary component Basic Salary, Transport Allowance, Meal Allowance, BPJS Deduction, PPh21.
- Payroll period bulan berjalan.

## Cara Menjalankan

```bash
pnpm prisma:seed
```

Atau dari package API:

```bash
pnpm --filter @mayan/api seed
```

## Catatan

- Seed memakai `upsert` dan natural-key lookup supaya aman dijalankan berulang.
- Semua data tenant memakai `companyId` dari company default.
- Password admin di-hash menggunakan bcrypt sebelum disimpan.
