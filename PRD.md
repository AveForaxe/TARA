# TARA Digital Hub — Product Requirements Document

> **Versi:** 2.0 | **Terakhir diperbarui:** 2026-07-09 | **Status:** Active Development

---

## 1. Visi & Tujuan

TARA adalah platform digital terintegrasi untuk Karang Taruna skala RT. Tujuan: digitalisasi layanan RT — event, laporan warga, iuran, pasar lokal — dalam satu ekosistem berbasis QR Code.

**Fokus saat ini:** Lengkapi semua fitur core sebelum deployment ke warga nyata.
**Skala target:** 1 RT, < 100 Kepala Keluarga.
**Deployment:** Belum direncanakan.

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 4 + Custom CSS (`index.css`) |
| Routing | React Router DOM 7 |
| Backend | Node.js + Express 5.2.1 |
| ORM | Prisma 5.22.0 |
| Database | PostgreSQL 18.2 (Laragon local) |
| Auth | QR Code → JWT (30 hari) + device binding |
| Dev Environment | Laragon (Windows 11) |
| Repository | https://github.com/AveForaxe/TARA.git (branch: `main`) |

---

## 3. User Roles & Kapabilitas

| Role | Akses |
|---|---|
| `DEVELOPER` | Full access — semua panel, audit log, master control |
| `ADMINISTRATOR` | Data warga, laporan masuk, dashboard admin |
| `KEUANGAN` | Data warga (read), input/kelola iuran, laporan keuangan |
| `KARANG TARUNA` | Manajemen event, produk pasar, data warga (read) |
| `KETUA RT` | Panel RT, data warga, laporan masuk |
| `WARGA` | Dasbor personal, lapor masalah, lihat kegiatan & pasar |

**Login Admin:** Scan QR Code → JWT di `sessionStorage` (expires saat browser tutup)
**Login Warga:** Scan QR identitas → JWT di `localStorage` (persistent 30 hari)

---

## 4. Modul & Status Fitur

### ✅ Selesai

**Warga (Public)**
- `Home` — Landing page, hero section, quick links
- `Kegiatan` — List event dari DB, form registrasi event publik
- `Pasar` — Katalog produk UMKM warga dari DB
- `Lapor` — Form laporan masalah lingkungan (auth required)
- `Dasbor` — Dashboard personal: stats counter animasi, identity card, quick actions, lock overlay blur saat belum login

**Admin Panel** (`/tara-system`)
- Login gate via QR scan (`AdminQRScannerModal`)
- Sidebar dinamis berdasarkan role, collapsible ke 80px
- `DashboardDeveloper` — Master stats, audit log real-time
- `DashboardAdmin` — Statistik warga, manajemen data
- `DashboardKeuangan` — Overview iuran & transaksi
- `DashboardKarangTaruna` — Event overview
- `DashboardRT` — Panel laporan masuk
- `DataWarga` — CRUD data warga, generate/regenerate QR Code
- `Keuangan` — CRUD iuran, validasi bukti transfer
- `ManajemenKegiatan` — CRUD event, upload proposal
- `ManajemenLaporan` — View & update status laporan warga
- `ManajemenProduk` — CRUD produk pasar (add/edit/delete/toggle-active)
- `AuditLogs` — Log seluruh aktivitas admin dengan filter

**Auth & Infrastructure**
- QR handshake (`POST /api/auth/handshake`)
- Device binding (`deviceId` + `isActivated` per user)
- Role-based route guard (`authGuard.js` + `roleCheck.js`)
- Audit logging otomatis di semua write operations
- Health check (`/api/health` → status PostgreSQL)
- PWA: `manifest.json` + `sw.js` + splash screen

### 📋 Direncanakan (Prioritas)

1. **Upload foto laporan** — Field `photoUrl` sudah ada di schema `Report`, tinggal implementasi UI + file storage (lokal/Cloudinary/S3)
2. **Notifikasi push/email** — FCM atau Web Push untuk update status laporan & event baru
3. **Registrasi warga mandiri** — Warga daftar sendiri, admin approve (opsional)
4. **Pembayaran iuran online** — Integrasi payment gateway

---

## 5. Struktur File

```
TARA/
├── backend/
│   ├── controllers/        # 8 file — logika bisnis semua pakai Prisma
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── financeController.js
│   │   ├── productController.js
│   │   ├── registrationController.js
│   │   ├── reportController.js
│   │   ├── statsController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authGuard.js    # Validasi JWT
│   │   └── roleCheck.js    # RBAC
│   ├── prisma/
│   │   ├── schema.prisma   # 7 model DB
│   │   ├── client.js       # Prisma client singleton
│   │   └── migrations/     # 2 migration PostgreSQL
│   ├── routes/             # 7 file route Express
│   ├── utils/logger.js     # Audit log helper
│   ├── server.js           # Entry point, PORT 5000
│   └── createAdmin.js      # Script buat user DEVELOPER + QR HTML
│
└── frontend/
    ├── public/
    │   ├── Tara-Icon.png   # Icon utama (PNG di-crop, tanpa transparent margin)
    │   ├── manifest.json   # PWA manifest
    │   └── sw.js           # Service worker
    ├── src/
    │   ├── components/
    │   │   ├── Layout.tsx              # Navbar + Footer + BottomNav
    │   │   ├── AdminLayout.tsx         # Sidebar + Header + login gate
    │   │   ├── QRScannerModal.tsx      # Scanner warga (full-screen mobile)
    │   │   ├── AdminQRScannerModal.tsx # Scanner admin (card desktop)
    │   │   └── Reveal.tsx              # Scroll reveal animation
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Kegiatan.tsx
    │   │   ├── Pasar.tsx
    │   │   ├── Lapor.tsx
    │   │   ├── Dasbor.tsx
    │   │   ├── NotFound.tsx
    │   │   └── admin/      # 11 halaman admin
    │   ├── utils/
    │   │   ├── api.ts          # apiFetch() + getApiBaseUrl()
    │   │   └── constants.ts    # ADMIN_PATH + ROLES enum
    │   ├── context/
    │   │   ├── NotificationContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── hooks/useCounter.ts
    │   ├── App.tsx             # Semua route definition
    │   ├── main.tsx            # Entry point React
    │   └── index.css           # Global styles (5000+ baris)
    └── index.html              # PWA shell + inline critical CSS (anti-FOUC)
```

---

## 6. Database Schema

| Model | Field Utama | Catatan |
|---|---|---|
| `User` | ucid, nama, blok, role, deviceId, isActivated, qrToken | ucid = unique citizen ID (format: `TARA-YYYY-NNNN`) |
| `Event` | title, date, description, location, status, proposal_url, proposal_status | status: Mendatang / Berlangsung / Selesai |
| `Report` | reporter_ucid, category, title, description, location, **photoUrl**, status | photoUrl belum diimplementasi di UI |
| `Finance` | ucid, jenis_iuran, nominal, status, bukti_transfer | status: Belum Bayar / Sudah Bayar |
| `EventRegistration` | event_id, nama, phone, alamat, ucid | ucid opsional (bisa non-member) |
| `Product` | title, category, price, description, icon, isActive | icon = Material Icon name |
| `AuditLog` | action, actor_ucid, actor_name, actor_role, ip_address, details (JSON) | Semua write ops tercatat |

---

## 7. API Endpoints

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/auth/handshake` | — | QR login semua role |
| GET | `/api/health` | — | Status PostgreSQL |
| GET/POST/PUT/DELETE | `/api/users` | Admin | CRUD warga |
| GET/POST/PUT/DELETE | `/api/events` | Mixed | CRUD event |
| POST | `/api/events/:id/register` | — | Registrasi event publik |
| GET/POST/PUT/DELETE | `/api/reports` | Auth | CRUD laporan |
| GET/POST/PUT/DELETE | `/api/finance` | Admin | CRUD iuran |
| GET/POST/PUT/DELETE | `/api/products` | Mixed | CRUD produk |
| GET | `/api/stats` | — | Statistik dashboard |
| GET | `/api/logs` | Admin | Audit logs |

---

## 8. UI/UX Standards

- **Dark mode default:** Background `#070B14` (deep navy-black)
- **Accent warna:** Muted rose pink `#D896A7` (warga) / Blue `#3b82f6` (admin)
- **Glassmorphism:** `backdrop-filter: blur(15px)`, `rgba` backgrounds, border `1px solid rgba(255,255,255,0.1)`
- **Border radius:** 16-24px card, 10px input, 8px button
- **Font:** Inter (Google Fonts, preconnect)
- **Icon:** Material Icons Round (CDN)
- **Logo:** `Tara-Icon.png` dalam container putih rounded — padding ~11% ukuran container, `box-sizing: border-box`, `display: flex + center`
- **Mobile-first:** Bottom nav untuk warga; admin sidebar collapsible
- **Form layout:** Input sticky kiri, data/tabel kanan (admin pages)

---

## 9. Development Setup

```bash
# 1. Start PostgreSQL di Laragon

# 2. Backend (PORT 5000)
cd backend
npm install
node createAdmin.js    # Buat DEVELOPER user + generate admin_qr.html
npm run dev

# 3. Frontend (PORT 5173)
cd frontend
npm install
npm run dev

# 4. Login admin
# Buka backend/admin_qr.html → simpan PNG → scan di /tara-system

# DB tools
cd backend
npx prisma migrate dev   # Jalankan setelah ubah schema.prisma
npx prisma studio        # GUI browser untuk DB
```

---

## 10. Success Metrics (Target)

- Semua fitur core selesai sebelum deployment
- Upload foto laporan tersedia
- Notifikasi aktif untuk update laporan
- Response API < 200ms untuk operasi read
- Zero paper untuk registrasi event
