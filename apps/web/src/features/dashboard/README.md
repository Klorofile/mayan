# Dashboard Feature

Feature `dashboard` adalah halaman utama MAYAN untuk monitoring operasional HR secara cepat.

## Pages

- `/dashboard` - executive dashboard dengan statistic cards, chart, reminder, latest leave request, dan expiring contracts.

## Data Source

- `GET /api/dashboard/summary`
- Fetching memakai TanStack Query melalui `getDashboardSummary()`.
- Halaman tetap menampilkan fallback kosong jika API belum aktif atau session belum valid.

## Components

- `dashboard-charts.tsx` - Recharts wrapper untuk weekly attendance bar chart dan distribution donut chart.
- `types.ts` - contract response dashboard agar frontend tetap type-safe.
- `api.ts` - adapter API summary endpoint.

## UI Notes

- Card statistik memakai komponen reusable `FeatureCard`.
- Empty state dipakai untuk chart/list yang belum punya data.
- Layout responsive: metric cards menjadi 4 kolom di desktop dan tetap nyaman di mobile.
