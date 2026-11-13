# Attendance Module

Module `attendance` menangani absensi karyawan dengan GPS geofence, kalkulasi keterlambatan, durasi kerja, correction request, approval correction, dan report by date range.

## REST Prefix

Semua endpoint berada di prefix:

```txt
/api/attendances
```

## Endpoints

- `GET /api/attendances` — list attendance dengan pagination dan filter.
- `GET /api/attendances/:id` — detail attendance.
- `POST /api/attendances/clock-in` — clock in.
- `POST /api/attendances/clock-out` — clock out.
- `POST /api/attendances/corrections` — request attendance correction.
- `PATCH /api/attendances/corrections/:id/approve` — approve correction.
- `PATCH /api/attendances/corrections/:id/reject` — reject correction.
- `GET /api/attendances/report` — report attendance by date range.

## Clock Payload

```json
{
  "employeeId": "optional-for-admin-or-hr",
  "attendanceDate": "2026-05-28",
  "latitude": -6.200000,
  "longitude": 106.816666,
  "notes": "Clock from office"
}
```

Jika `employeeId` tidak dikirim, service memakai `employeeId` dari authenticated user.

## Business Rules

- Satu employee hanya boleh clock in sekali per tanggal.
- Clock out hanya bisa dilakukan jika sudah clock in.
- Clock out kedua kali akan ditolak.
- GPS divalidasi berdasarkan `Branch.latitude`, `Branch.longitude`, dan `Branch.radiusMeter`.
- Jika lokasi di luar radius branch, API mengembalikan error `403 Forbidden`.
- Jika branch belum punya koordinat GPS, API mengembalikan error `400 Bad Request`.
- `attendanceDate` disimpan sebagai start-of-day agar unique constraint per tanggal stabil.

## Attendance Status

Status yang didukung:

- `PRESENT`
- `LATE`
- `ABSENT`
- `LEAVE`
- `SICK`
- `PERMISSION`

## Calculations

- `lateMinutes` dihitung dari jam masuk pada `WorkSchedule` sesuai hari attendance.
- `workingMinutes` dihitung dari selisih `clockOutAt - clockInAt`.
- Jam kerja di `WorkSchedule` disimpan dalam format string `HH:mm`, misalnya `09:00`.

## Query Examples

```txt
GET /api/attendances?page=1&limit=10&startDate=2026-05-01&endDate=2026-05-31&status=LATE
GET /api/attendances/report?startDate=2026-05-01&endDate=2026-05-31
```

## Important Files

- `attendance.controller.ts` — REST endpoint.
- `attendance.service.ts` — GPS validation, clock rules, calculations, correction approval, report.
- `dto/clock.dto.ts` — clock-in/out payload validation.
- `dto/list-attendance-query.dto.ts` — pagination and filter validation.
- `dto/create-attendance-correction.dto.ts` — correction request validation.
