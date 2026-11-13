# Attendance Frontend Feature

Feature ini berisi UI dan integration layer untuk Attendance Management.

## API Integration

Endpoint backend yang dipakai:

- `GET /api/attendances`
- `POST /api/attendances/clock-in`
- `POST /api/attendances/clock-out`
- `POST /api/attendances/corrections`
- `PATCH /api/attendances/corrections/:id/approve`
- `PATCH /api/attendances/corrections/:id/reject`

## Components

- `clock-card.tsx` — clock in/out button dengan browser Geolocation API.
- `use-browser-location.ts` — hook untuk request lokasi dan handle permission denied.
- `attendance-summary.tsx` — card summary present, late, working hours.
- `attendance-history-table.tsx` — reusable attendance history table.
- `status-badge.tsx` — status badge untuk attendance dan correction.
- `api.ts` — TanStack Query friendly API functions.

## Important UX Rules

- Jika permission lokasi ditolak, user mendapat pesan jelas.
- Clock in/out menampilkan loading saat submit.
- Error dari backend ditampilkan eksplisit.
- Layout memakai grid responsive untuk mobile dan desktop.
