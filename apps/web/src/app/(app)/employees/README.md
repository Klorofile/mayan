# Employee Management Pages

Route group ini berisi halaman Employee Management.

## Pages

- `/employees` — table employee, search, filter department/status, pagination.
- `/employees/create` — create employee form.
- `/employees/[id]` — detail employee dengan tabs.
- `/employees/[id]/edit` — edit employee form.

## UX Patterns

- List memakai TanStack Query dengan query key `["employees", filters]`.
- Detail memakai query key `["employee", id]`.
- Setelah create/edit berhasil, cache list/detail di-invalidate dan user diarahkan ke halaman detail.
- Loading, empty state, badge, table, dan card memakai reusable UI components.
