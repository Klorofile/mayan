# MAYAN Web

Frontend MAYAN dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Shadcn-style UI primitives, TanStack Query, Axios, React Hook Form, dan Zod.

## Design Direction

- SaaS modern, clean, enterprise.
- Sidebar kiri dark dengan aksen neon green.
- Topbar sticky dengan search, notification, profile, dan logout.
- Dashboard responsive dengan statistik, chart placeholder, table, form, modal, empty state, dan loading state.

## Main Structure

```txt
src/app/(app)              Protected application routes
src/components/layout      Sidebar and topbar shell
src/components/ui          Shadcn-style reusable UI primitives
src/components             Feature/reusable dashboard components
src/lib                    API client, auth helpers, utilities
```

## App Routes

- `/dashboard`
- `/employees`
- `/attendance`
- `/leave`
- `/payroll`
- `/recruitment`
- `/performance`
- `/reports`
- `/settings`

## Reusable Components

- `components/reusable-table.tsx` — table abstraction dengan column render function.
- `components/reusable-form.tsx` — simple reusable form shell.
- `components/ui/modal.tsx` — modal dependency-light.
- `components/ui/empty-state.tsx` — empty state untuk halaman tanpa data.
- `components/ui/loading-state.tsx` — skeleton loading cards.

## Run

```bash
pnpm --filter @mayan/web dev
```

Pastikan `NEXT_PUBLIC_API_URL` mengarah ke API:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

## Quality

```bash
pnpm --filter @mayan/web lint
pnpm --filter @mayan/web test
pnpm --filter @mayan/web build
```

- ESLint memakai `next/core-web-vitals`.
- Test memakai Vitest, jsdom, Testing Library, dan jest-dom matcher.
- `src/components/ui/button.test.tsx` memvalidasi reusable UI component.
- `src/features/employees/employee-form.test.ts` memvalidasi schema form employee.
