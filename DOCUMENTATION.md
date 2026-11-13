# Dokumentasi Teknis & Fungsional MAYAN HRIS

MAYAN adalah aplikasi Human Resource Information System (HRIS) modern tingkat *enterprise* dengan arsitektur monorepo bergaya Talenta. Sistem ini dirancang untuk menangani pengelolaan karyawan (*employee management*), absensi berbasis geolokasi (*attendance*), permohonan dan persetujuan cuti (*leave management*), kalkulasi penggajian (*payroll basic*), analitik dasbor interaktif, serta kontrol akses berbasis peran (*Role-Based Access Control / RBAC*) dengan isolasi data *multi-tenant*.

---

## Daftar Isi
1. [Gambaran Umum & Arsitektur Sistem](#1-gambaran-umum--arsitektur-sistem)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Direktori Proyek](#3-struktur-direktori-proyek)
4. [Model Data & Skema Database](#4-model-data--skema-database)
5. [Fitur Utama & Alur Bisnis](#5-fitur-utama--alur-bisnis)
6. [Katalog Endpoint REST API](#6-katalog-endpoint-rest-api)
7. [Panduan Instalasi & Menjalankan Sistem](#7-panduan-instalasi--menjalankan-sistem)
8. [Pengujian & Kualitas Kode](#8-pengujian--kualitas-kode)
9. [Prinsip Desain Enterprise & Keamanan](#9-prinsip-desain-enterprise--keamanan)

---

## 1. Gambaran Umum & Arsitektur Sistem

MAYAN dibangun menggunakan struktur monorepo berbasis **pnpm workspaces**. Seluruh aplikasi terbagi menjadi lapisan klien web, backend API layanan mandiri, dan pustaka kontrak tipe bersama (*shared types*).

```mermaid
flowchart TD
    User([Pengguna / Karyawan / HR]) -->|HTTPS / UI| WebApp["Web Client (Next.js 14 App Router)"]
    WebApp -->|REST API / JWT| ApiServer["API Server (NestJS)"]
    ApiServer -->|Prisma ORM| Database[("PostgreSQL 16")]
    
    subgraph Monorepo ["Monorepo Workspace (pnpm)"]
        WebApp
        ApiServer
        SharedLib["@mayan/shared (Shared TypeScript Types)"]
        SharedLib -.->|Import Types| WebApp
        SharedLib -.->|Import Types| ApiServer
    end
```

### Karakteristik Arsitektur
- **Multi-Tenancy Scoped by Company**: Setiap data transaksional dan operasional terikat ke `companyId`, memastikan isolasi data antar entitas perusahaan.
- **Strict RBAC**: Setiap aksi diproteksi di tingkat rute menggunakan decorator guard berbasis peran dan izin spesifik (`resource.action`).
- **Single Source of Truth**: Tipe antarmuka (*interface types*) didefinisikan secara tersentralisasi pada package `@mayan/shared` sehingga kontrak request/response antara frontend dan backend selalu sinkron.

---

## 2. Tech Stack

| Lapisan | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Monorepo Manager** | `pnpm` (v9.12.3) | Pengelolaan workspace monorepo terpadu, caching dependensi cepat |
| **Frontend Framework** | **Next.js 14** (App Router) | Server-Side Rendering (SSR), Client Components, Routing modern |
| **UI Library & Styling** | **Tailwind CSS**, Shadcn UI Style, Radix UI | Komponen antarmuka modular, responsif, dan konsisten |
| **State & Data Fetching** | **TanStack Query** (React Query v5), Axios | Caching, revalidasi data otomatis, manajemen request API |
| **Form & Validasi Web** | **React Hook Form**, **Zod** | Form handling dengan validasi skema tipe aman (*type-safe*) |
| **Visualisasi Data** | **Recharts**, Lucide Icons | Grafik statistik presensi mingguan dan distribusi departemen |
| **Backend Framework** | **NestJS 10** | Modular architecture, Dependency Injection, Validation Pipes |
| **ORM & Database** | **Prisma ORM**, **PostgreSQL 16** | Migrasi skema database deklaratif, type-safe query generation |
| **Keamanan & Auth** | **Passport.js**, **JWT**, **Bcrypt.js** | Otentikasi Access Token (15m) & Refresh Token (7d) |
| **Testing** | **Jest**, **Supertest**, **Vitest**, RTL | Unit test kalkulator gaji dan E2E HTTP contract testing |

---

## 3. Struktur Direktori Proyek

```txt
mayan/
├── .env.example               # Contoh environment global
├── docker-compose.yml         # Konfigurasi container PostgreSQL 16
├── package.json               # Konfigurasi root monorepo scripts
├── pnpm-workspace.yaml        # Definisi workspace pnpm
├── tsconfig.base.json         # Konfigurasi TypeScript dasar
│
├── apps/
│   ├── api/                   # Backend Application (NestJS)
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Skema model basis data
│   │   │   ├── migrations/    # Berkas riwayat migrasi database
│   │   │   └── seed.ts        # Script seed data awal (idempotent)
│   │   ├── src/
│   │   │   ├── features/      # Modul bisnis terisolasi:
│   │   │   │   ├── attendance # Presensi, jadwal, geolocation, koreksi
│   │   │   │   ├── auth       # Otentikasi, JWT strategy, login/register
│   │   │   │   ├── dashboard  # Agregasi data analitik & metrik
│   │   │   │   ├── employees  # CRUD karyawan, dokumen, kontrak, gaji pokok
│   │   │   │   ├── leave      # Pengajuan cuti, jenis cuti, approval
│   │   │   │   ├── payroll    # Komponen gaji, periode, kalkulasi, payslip
│   │   │   │   ├── permissions# Master data hak akses
│   │   │   │   ├── rbac       # Guard peran dan otorisasi
│   │   │   │   ├── roles      # Master data peran pengguna
│   │   │   │   └── users      # Pengguna sistem & relasi karyawan
│   │   │   └── infra/         # Konfigurasi Prisma Service & Global Filters
│   │   └── test/              # HTTP E2E Contract Testing
│   │
│   └── web/                   # Frontend Application (Next.js 14)
│       └── src/
│           ├── app/
│           │   ├── (app)/     # Protected route group dengan Layout dashboard
│           │   │   ├── attendance/ # Halaman presensi & riwayat
│           │   │   ├── dashboard/  # Halaman analitik metrik utama
│           │   │   ├── employees/  # Halaman master data & form karyawan
│           │   │   ├── leaves/     # Halaman pengajuan & status cuti
│           │   │   ├── payroll/    # Halaman pengelolaan periode & slip gaji
│           │   │   ├── roles/      # Halaman manajemen peran & izin
│           │   │   └── settings/   # Pengaturan preferensi sistem
│           │   ├── login/     # Halaman login publik
│           │   └── layout.tsx # Root HTML layout & font loader
│           ├── components/    # Komponen UI umum (sidebar, topbar, table, card, dialog)
│           ├── features/      # Komponen form, tabel, query hook spesifik per modul
│           └── lib/           # Klien Axios (`api.ts`), helper auth, utilitas kelas
│
└── packages/
    └── shared/                # Pustaka tipe TypeScript bersama
        └── src/
            ├── index.ts
            └── types/         # Kontrak payload DTO & model bersama
                ├── auth.ts
                ├── employee.ts
                ├── hris.ts
                └── rbac.ts
```

---

## 4. Model Data & Skema Database

Skema database diatur menggunakan Prisma ORM dengan relasi relasional PostgreSQL:

```mermaid
erDiagram
    Company ||--o{ Branch : "memiliki"
    Company ||--o{ Department : "memiliki"
    Company ||--o{ Position : "memiliki"
    Company ||--o{ User : "memiliki"
    Company ||--o{ Role : "memiliki"
    Company ||--o{ Employee : "mempekerjakan"
    
    Employee ||--o| User : "terhubung ke akun"
    Employee ||--o{ Attendance : "melakukan"
    Employee ||--o{ LeaveRequest : "mengajukan"
    Employee ||--o{ LeaveBalance : "memiliki saldo"
    Employee ||--o{ EmployeeSalary : "memiliki histori"
    Employee ||--o{ Payroll : "menerima"
    Employee ||--o{ EmployeeDocument : "mengunggah"
    Employee ||--o{ EmployeeContract : "terikat"
    Employee ||--o{ EmployeeBankAccount : "memiliki rekening"
    
    WorkSchedule ||--o{ Employee : "diterapkan ke"
    WorkSchedule ||--o{ Attendance : "jadwal referensi"
    
    PayrollPeriod ||--o{ Payroll : "memuat slip gaji"
    Payroll ||--o{ PayrollComponent : "terdiri dari"
    SalaryComponent ||--o{ PayrollComponent : "definisi item"
```

### Entitas Kunci
1. **Multi-Tenant & Organisasi**:
   - `Company`: Entitas perusahaan dengan `companyCode` unik.
   - `Branch`: Kantor cabang dengan titik koordinat (`latitude`, `longitude`) dan `radiusMeter` untuk validasi presensi fisik.
   - `Department` & `Position`: Hierarki divisi dan jabatan karyawan.
2. **Keamanan & Pengguna**:
   - `User`: Akun otentikasi login email & kata sandi terenkripsi.
   - `Role` & `Permission`: Matriks peran sistem (`SUPER_ADMIN`, `HR_ADMIN`, `MANAGER`, `EMPLOYEE`) serta izin granular (`attendance.create`, `payroll.generate`, dll.).
3. **Karyawan (*Employee*)**:
   - Menyimpan profil personal, NIK (`employeeNumber`), email, status kepegawaian (`PROBATION`, `ACTIVE`, `RESIGNED`, `TERMINATED`).
   - Menyimpan relasi dokumen identitas/kepegawaian, riwayat kontrak kerja, informasi bank pencairan gaji, dan histori gaji pokok efektif.
4. **Presensi & Jadwal Kerja**:
   - `WorkSchedule`: Pengaturan hari dan jam kerja (`mondayStart`, `fridayEnd`, dll.) serta jenis jadwal (`FIXED`, `SHIFT`, `FLEXIBLE`).
   - `Attendance`: Pencatatan `clockInAt`, `clockOutAt`, koordinat geolokasi, kalkulasi `lateMinutes`, `workingMinutes`, dan status (`PRESENT`, `LATE`, `ABSENT`).
   - `AttendanceCorrection`: Mekanisme pengajuan koreksi absensi jika terjadi kendala lupa absen atau dinas luar.
5. **Cuti (*Leave*)**:
   - `LeaveType`: Jenis cuti (Cuti Tahunan, Sakit, Bersalin) beserta kuota tahunan dan pengaturan approval.
   - `LeaveBalance`: Saldo kuota cuti per karyawan per tahun kalender.
   - `LeaveRequest`: Permohonan cuti karyawan dengan alur persetujuan bertingkat (Manager dan HR).
6. **Penggajian (*Payroll*)**:
   - `PayrollPeriod`: Periode bulan penggajian dengan status (`OPEN`, `LOCKED`, `PROCESSED`, `CLOSED`).
   - `SalaryComponent`: Komponen penghasilan (`EARNING`), potongan (`DEDUCTION`), tunjangan (`BENEFIT`), atau pajak (`TAX`).
   - `Payroll`: Hasil kalkulasi gaji bersih (*take-home pay*):
     $$\text{Gross Pay} = \text{Basic Salary} + \text{Allowance} + \text{Overtime}$$
     $$\text{Net Pay} = \text{Gross Pay} - \text{Total Deduction} - \text{Tax}$$

---

## 5. Fitur Utama & Alur Bisnis

### A. Otentikasi & Otorisasi (RBAC)
- Login menggunakan email dan password. Server mengembalikan JWT Access Token (15 menit) dan Refresh Token (7 hari).
- Role default yang tersedia dari seed:
  - **SUPER_ADMIN**: Hak akses penuh ke seluruh modul sistem dan konfigurasi peran/izin.
  - **HR_ADMIN**: Pengelolaan operasional SDM, karyawan, absensi, approval cuti tingkat HR, dan kalkulasi penggajian.
  - **MANAGER**: Melihat profil departemen, riwayat absensi tim, dan approval cuti tingkat manajerial.
  - **EMPLOYEE**: Melakukan clock-in/clock-out, mengajukan cuti, dan melihat payslip pribadi.

### B. Siklus Manajemen Karyawan
- **Onboarding**: Pendaftaran data karyawan baru, penempatan departemen/cabang, dan pembuatan akun pengguna terkait.
- **Manajemen Berkas**: Penyimpanan dokumen (KTP, NPWP, Ijazah, Kontrak) dengan tracking masa berlaku berkas.
- **Kompensasi Awal**: Penentuan gaji pokok dengan tanggal efektif (`effectiveFrom`) dan nomor rekening pencairan.

### C. Presensi Berbasis Lokasi (Attendance & Geolocation)
1. Karyawan membuka menu presensi di web client.
2. Web client meminta koordinat GPS perangkat via browser Geolocation API.
3. Karyawan menekan tombol **Clock In** atau **Clock Out**.
4. Backend memverifikasi jarak koordinat terhadap cabang (`Branch`) yang ditugaskan menggunakan formula jarak (Haversine/Radius).
5. Sistem menghitung keterlambatan (`lateMinutes`) otomatis berdasarkan jam mulai jadwal kerja (`WorkSchedule`).
6. Jika karyawan berhalangan hadir atau lupa presensi, tersedia form **Attendance Correction** yang dapat disetujui oleh atasan/HR.

### D. Manajemen Cuti (Leave Lifecycle)
1. Karyawan memeriksa saldo sisa cuti tahun berjalan melalui dasbor cuti.
2. Karyawan mengisi form permohonan dengan memilih tanggal mulai, tanggal selesai, jenis cuti, dan alasan.
3. Sistem memvalidasi apakah saldo cuti karyawan mencukupi.
4. **Approval Step 1**: Manajer divisi memeriksa dan menyetujui permohonan (`manager-approve`).
5. **Approval Step 2**: HR Admin memberikan persetujuan final (`hr-approve`).
6. Setelah disetujui, saldo sisa cuti pada tabel `LeaveBalance` langsung terpotong.

### E. Penggajian (Payroll Engine)
1. HR membuat periode penggajian baru (contoh: `2026-05`).
2. HR menjalankan trigger generate penggajian:
   - Sistem mengambil gaji pokok aktif karyawan.
   - Sistem mengakumulasikan komponen gaji tetap dan komponen dinamis.
   - Sistem menghitung potongan kehadiran atau pajak.
3. HR memeriksa draft kalkulasi pada tabel penggajian.
4. Penguncian periode (*Lock Period*) untuk memfinalisasi status penggajian.
5. HR dapat mengekspor rekap penggajian ke format `.csv` untuk integrasi transfer bank massal (*bank bulk transfer*).
6. Karyawan dapat melihat dan mengunduh slip gaji (*payslip*) masing-masing.

---

## 6. Katalog Endpoint REST API

Semua rute bisnis beroperasi di bawah basis rute `/api` dan membutuhkan header:
`Authorization: Bearer <access_token>` (kecuali endpoint login/register).

### Autentikasi (`/api/auth`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-admin` | Publik (First Setup) | Pendaftaran entitas company & akun super admin awal |
| `POST` | `/api/auth/login` | Publik | Otentikasi pengguna, menghasilkan token JWT |
| `POST` | `/api/auth/refresh` | Refresh Token | Memperbarui access token yang kedaluwarsa |
| `GET` | `/api/auth/me` | JWT Guard | Mengambil identitas pengguna & daftar izin aktif |

### Dasbor Analitik (`/api/dashboard`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | `dashboard.read` | Statistik total karyawan, presensi harian, pending cuti, dan grafik |

### Manajemen Karyawan (`/api/employees`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | `employee.read` | Menampilkan daftar karyawan dengan filter & pagination |
| `POST` | `/api/employees` | `employee.create` | Menambahkan data karyawan baru |
| `GET` | `/api/employees/:id` | `employee.read` | Mengambil detail profil karyawan lengkap |
| `PATCH` | `/api/employees/:id` | `employee.update` | Memperbarui informasi personal / jabatan karyawan |
| `DELETE` | `/api/employees/:id` | `employee.delete` | Soft-delete data karyawan |
| `GET` | `/api/employees/:id/documents`| `employee.read` | Daftar dokumen berkas karyawan |
| `POST` | `/api/employees/:id/documents`| `employee.update` | Menambahkan metadata/lampiran berkas baru |
| `GET` | `/api/employees/:id/salaries` | `employee.read` | Riwayat perubahan gaji pokok |
| `POST` | `/api/employees/:id/salaries` | `employee.update` | Merekam nominal gaji pokok baru |
| `GET` | `/api/employees/:id/bank-accounts` | `employee.read` | Daftar rekening bank karyawan |
| `POST` | `/api/employees/:id/bank-accounts`| `employee.update` | Mendaftarkan rekening bank karyawan |

### Presensi & Absensi (`/api/attendances`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendances` | `attendance.read` | Riwayat log presensi karyawan |
| `GET` | `/api/attendances/report`| `attendance.read` | Laporan rekap presensi per periode |
| `POST` | `/api/attendances/clock-in` | `attendance.create` | Rekam jam masuk dengan koordinat GPS |
| `POST` | `/api/attendances/clock-out`| `attendance.create` | Rekam jam keluar dengan koordinat GPS |
| `POST` | `/api/attendances/corrections` | `attendance.create` | Pengajuan koreksi absensi yang salah/terlewat |
| `PATCH`| `/api/attendances/corrections/:id/approve` | `attendance.update` | Persetujuan koreksi absensi oleh atasan/HR |
| `PATCH`| `/api/attendances/corrections/:id/reject` | `attendance.update` | Penolakan koreksi absensi |

### Pengelolaan Cuti (`/api/leaves`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/types` | `leave.read` | Daftar jenis cuti yang tersedia |
| `POST` | `/api/leaves/types` | `leave.create` | Menambahkan jenis cuti dan alokasi kuota |
| `GET` | `/api/leaves/balances` | `leave.read` | Menampilkan saldo kuota cuti karyawan |
| `GET` | `/api/leaves` | `leave.read` | Riwayat dan daftar permohonan cuti |
| `POST` | `/api/leaves` | `leave.create` | Mengajukan permohonan cuti baru |
| `GET` | `/api/leaves/calendar` | `leave.read` | Kalender jadwal cuti bersama tim |
| `PATCH`| `/api/leaves/:id/manager-approve` | `leave.approve` | Persetujuan tahap 1 oleh Manager |
| `PATCH`| `/api/leaves/:id/hr-approve` | `leave.approve` | Persetujuan tahap 2 (final) oleh HR |
| `PATCH`| `/api/leaves/:id/reject` | `leave.approve` | Penolakan permohonan cuti |
| `PATCH`| `/api/leaves/:id/cancel` | `leave.create` | Pembatalan cuti oleh pemohon |

### Penggajian / Payroll (`/api/payrolls`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payrolls/periods` | `payroll.read` | Daftar periode penggajian |
| `POST` | `/api/payrolls/periods` | `payroll.generate` | Membuat periode penggajian baru |
| `POST` | `/api/payrolls/periods/:periodId/generate` | `payroll.generate` | Menjalankan kalkulasi gaji massal periode terkait |
| `POST` | `/api/payrolls/periods/:periodId/lock` | `payroll.generate` | Mengunci periode agar data tidak dapat diubah lagi |
| `GET` | `/api/payrolls/periods/:periodId/export.csv` | `payroll.read` | Ekspor rekap gaji periode ke format file CSV |
| `GET` | `/api/payrolls` | `payroll.read` | Daftar slip gaji karyawan |
| `GET` | `/api/payrolls/:id` | `payroll.read` | Detail slip gaji individual |
| `GET` | `/api/payrolls/:id/payslip` | `payroll.read` | Tampilan format cetak slip gaji karyawan |

### Pengaturan Role & Permission (`/api/roles` & `/api/permissions`)
| Method | Rute | Izin / Guard | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/roles` | `role.read` | Mengambil seluruh daftar peran |
| `POST` | `/api/roles` | `role.create` | Membuat peran pengguna baru |
| `PUT` | `/api/roles/:id/permissions` | `role.update` | Memperbarui matriks hak akses peran |
| `GET` | `/api/permissions` | `permission.read` | Menampilkan seluruh daftar izin sistem |

---

## 7. Panduan Instalasi & Menjalankan Sistem

### Prasyarat Perangkat Lunak
- **Node.js**: versi `18.18.0` atau `>= 20.x`
- **pnpm**: versi `^9.12.0`
- **Docker & Docker Compose** (Opsional untuk PostgreSQL lokal)

### Langkah 1: Kloning & Pengaturan Environment
Salin konfigurasi environment dari template:

```bash
# Environment global root
cp .env.example .env

# Environment untuk API (NestJS)
cp apps/api/.env.example apps/api/.env

# Environment untuk Web (Next.js)
cp apps/web/.env.example apps/web/.env.local
```

### Langkah 2: Menjalankan Basis Data PostgreSQL
Jika menggunakan Docker Compose:
```bash
docker compose up -d
```
Pastikan variabel `DATABASE_URL` pada `.env` dan `apps/api/.env` mengarah ke database Anda:
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/mayan?schema=public"
```

### Langkah 3: Install Dependensi & Sinkronisasi Skema
```bash
# 1. Install semua paket monorepo
pnpm install

# 2. Generate Prisma Client
pnpm prisma:generate

# 3. Jalankan migrasi basis data
pnpm prisma:migrate

# 4. Lakukan seeding data awal (Perusahaan, Akun Demo, Cabang, Jadwal, Karyawan)
pnpm prisma:seed
```

### Langkah 4: Menjalankan Server Pengembangan
Jalankan aplikasi web dan API sekaligus secara paralel:
```bash
pnpm dev
```
Atau jalankan secara terpisah pada terminal berbeda:
```bash
# Terminal 1: Backend API (Port 4000)
pnpm dev:api

# Terminal 2: Web Client (Port 3000)
pnpm dev:web
```

### Akses Aplikasi & Akun Default
- **Frontend URL**: `http://localhost:3000`
- **Backend API URL**: `http://localhost:4000/api`

**Akun Administrator (dari Seed):**
- **Email**: `admin@hrispro.com`
- **Password**: `Admin123!`

---

## 8. Pengujian & Kualitas Kode

Sistem MAYAN dilengkapi dengan pengujian terotomatisasi (*automated testing*) untuk memastikan reliabilitas logika bisnis:

```bash
# Menjalankan seluruh pengujian (API unit & E2E + Web test)
pnpm test

# Menjalankan pengujian spesifik backend API
pnpm test:api

# Menjalankan pengujian unit kalkulator penggajian
pnpm --filter @mayan/api test:unit

# Menjalankan pengujian E2E HTTP API contracts
pnpm --filter @mayan/api test:e2e

# Menjalankan pengujian komponen frontend
pnpm test:web

# Pemeriksaan linter kode
pnpm lint

# Format otomatis kode (Prettier)
pnpm format
```

---

## 9. Prinsip Desain Enterprise & Keamanan

1. **Idempotent Data Seeding**:
   Script `seed.ts` dirancang bersifat idempoten menggunakan `upsert`. Anda dapat mengeksekusi seed berkali-kali tanpa khawatir duplikasi data atau error *unique constraint*.
2. **Kalkulasi Desimal Berpresisi Tinggi**:
   Semua nilai moneter pada modul penggajian dan kuota cuti menggunakan tipe data `Decimal` (bukan float) untuk menghindari isu presisi pembulatan matematis.
3. **Penyimpanan Password Aman**:
   Kata sandi disimpan menggunakan hashing satu arah `bcrypt` dengan *salt rounds* standar industri.
4. **Validasi Skema Berlapis**:
   Setiap request masukan divalidasi dua kali: di sisi klien menggunakan Zod schema, dan di sisi server menggunakan NestJS `ValidationPipe` berbasis DTO bertipe ketat.
