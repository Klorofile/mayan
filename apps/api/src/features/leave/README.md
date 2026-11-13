# Leave Management Module

Module `leave` menangani master leave type, saldo cuti tahunan, pengajuan cuti, approval manager/HR, calendar, dan report.

## REST Prefix

```txt
/api/leaves
```

## Endpoints

### Leave Type

- `GET /api/leaves/types` — list master leave type.
- `POST /api/leaves/types` — create leave type.
- `PATCH /api/leaves/types/:id` — update leave type.
- `DELETE /api/leaves/types/:id` — soft delete leave type.

### Leave Balance

- `GET /api/leaves/balances` — list balance per employee/year.
- `PUT /api/leaves/balances` — create/update balance.

### Leave Request

- `GET /api/leaves` — list leave request dengan pagination/filter.
- `POST /api/leaves` — employee apply leave.
- `PATCH /api/leaves/:id/manager-approve` — manager approval.
- `PATCH /api/leaves/:id/hr-approve` — HR approval dan deduct balance.
- `PATCH /api/leaves/:id/reject` — reject leave.
- `PATCH /api/leaves/:id/cancel` — cancel leave dan restore balance jika sudah approved.

### Calendar & Report

- `GET /api/leaves/calendar?startDate=2026-05-01&endDate=2026-05-31`
- `GET /api/leaves/report?startDate=2026-05-01&endDate=2026-05-31`

## Business Rules

- Apply leave wajib memiliki saldo cukup pada `LeaveBalance`.
- Leave tidak boleh overlap dengan request lain yang statusnya `PENDING` atau `APPROVED`.
- Saat apply, saldo hanya dicek, belum dikurangi.
- Saat HR approve, saldo dikurangi dari `remaining` dan ditambahkan ke `used`.
- Saat reject, saldo tidak berubah.
- Saat cancel setelah approved, saldo dikembalikan.
- Approval final wajib melewati manager approval terlebih dahulu.

## Attachment

`POST /api/leaves` mendukung field:

```json
{
  "attachmentUrl": "https://example.com/medical-certificate.pdf"
}
```

## Important Files

- `leave.controller.ts` — REST endpoint Leave Management.
- `leave.service.ts` — business rules, balance mutation, overlap validation, calendar/report.
- `dto/create-leave-request.dto.ts` — apply leave payload.
- `dto/create-leave-type.dto.ts` — master leave type payload.
- `dto/upsert-leave-balance.dto.ts` — annual balance payload.
