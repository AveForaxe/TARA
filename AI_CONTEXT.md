# AI Context — TARA Project

> Baca file ini di awal setiap sesi kerja. Update bagian **Changelog** setiap akhir sesi mayor.
> Untuk gambaran fitur lengkap, baca `PRD.md`.

---

## Snapshot Proyek

| | |
|---|---|
| **Nama** | TARA Digital Hub (Karang Taruna) |
| **Status** | Active development — tambah fitur dulu, belum rencana deploy |
| **Repo** | https://github.com/AveForaxe/TARA.git (branch: `main`) |
| **Dev OS** | Windows 11, Laragon, PowerShell + Git Bash |
| **Frontend** | React 19 + TypeScript + Vite 8 + Tailwind CSS 4 |
| **Backend** | Node.js + Express 5.2.1 + Prisma 5.22.0 + PostgreSQL 18.2 |
| **Auth** | QR Code scan → JWT 30 hari + device binding |
| **Skala** | 1 RT, < 100 KK |

---

## File Kritis — Selalu Cek Sebelum Edit

| File | Fungsi | Perhatian |
|---|---|---|
| `backend/prisma/schema.prisma` | Definisi semua model DB | Setiap ubah schema → wajib `npx prisma migrate dev` |
| `backend/server.js` | Entry point Express (PORT 5000) | Semua route terdaftar di sini |
| `frontend/src/utils/constants.ts` | `ADMIN_PATH` + `ROLES` enum | Dipakai di seluruh codebase frontend |
| `frontend/src/utils/api.ts` | `apiFetch()` + `getApiBaseUrl()` | **Jangan pernah hardcode URL localhost** |
| `frontend/src/App.tsx` | Semua route definition | Route admin pakai `AdminLayout` wrapper |
| `frontend/src/index.css` | Global styles (5000+ baris) | Grep dulu sebelum edit — sangat besar |
| `frontend/index.html` | PWA shell | Ada inline `<style>` anti-FOUC untuk splash screen — jangan hapus |
| `backend/.env` | DB credentials | **TIDAK PERNAH DI-COMMIT** (ada di `.gitignore`) |
| `mcp.json` | MCP config Google Cloud | **TIDAK PERNAH DI-COMMIT** (ada API key yang pernah exposed) |

---

## Keputusan Arsitektur

| Keputusan | Alasan |
|---|---|
| Migrasi MongoDB → PostgreSQL + Prisma | Relasi data lebih ketat; Prisma type-safe; cocok untuk data RT yang terstruktur |
| Auth via QR Code (bukan password) | Warga tidak perlu ingat password; QR = identitas permanen yang bisa di-reset admin |
| JWT 30 hari + device binding | Satu warga = satu device; `deviceId` di header mencegah QR dipakai orang lain |
| `sessionStorage` untuk admin JWT | Admin session otomatis expire saat browser tutup — lebih aman |
| `localStorage` untuk warga JWT | Warga perlu persistent login di HP pribadi |
| `getApiBaseUrl()` di semua fetch | Beda URL dev (`localhost:5000`) vs prod; jangan hardcode |
| Vite proxy `/api` → `:5000` | Dev bebas CORS; frontend `:5173` dan backend `:5000` jalan paralel |
| Inline critical CSS di `index.html` | Cegah FOUC — splash screen harus muncul benar sebelum JS bundle load |
| `overflow: hidden` dihapus dari logo | PNG Tara-Icon.png sudah di-crop; pakai `padding` + `box-sizing: border-box` saja |
| File upload QR pakai hidden div terpisah | `Html5Qrcode.scanFile()` butuh DOM element; instance terpisah dari camera scanner agar tidak saling block |

---

## Pola Kode yang Sudah Ditetapkan

```ts
// Semua API call wajib pakai ini:
import { apiFetch, getApiBaseUrl } from '../utils/api';

// Fetch tanpa auth (public):
const res = await fetch(`${getApiBaseUrl()}/api/products`);

// Fetch dengan auth (JWT dari sessionStorage/localStorage):
const res = await apiFetch('/api/users');

// Role check:
import { ROLES } from '../utils/constants';
if (user.role === ROLES.DEVELOPER) { ... }
```

```js
// Admin route pattern di App.tsx:
<Route path={`${ADMIN_PATH}/nama-halaman`} element={<AdminLayout><NamaHalaman /></AdminLayout>} />

// Tambah menu item di AdminLayout.tsx:
{ name: 'Nama Menu', path: `${ADMIN_PATH}/path`, icon: 'material_icon_name', roles: [ROLES.DEVELOPER] }
```

---

## Status Fitur Saat Ini

### ✅ Berfungsi
- QR login warga dan admin (kamera + upload file)
- CRUD lengkap: warga, event, laporan, keuangan, produk
- Dasbor warga (stats animasi, identity card, quick actions, lock overlay)
- 6 dashboard admin berbasis role
- Audit logging otomatis semua write operations
- Health check indicator PostgreSQL di admin header
- PWA shell + splash screen (anti-FOUC)

### ⚠️ Ada Tapi Belum Selesai
- `photoUrl` di model `Report` — field sudah ada di DB tapi UI upload foto belum dibuat
- `frontend/dist/` — build lama, gitignored, ada di disk tapi belum update

### 📋 Next Priorities
1. **Upload foto laporan** — UI attach foto + pilih storage (lokal vs cloud)
2. **Notifikasi push/email** — FCM atau Web Push API

---

## Changelog

### 2026-07-09 · Session 3 — Cleanup & Logo Fix
**Commit:** `6d62bd2`
- **Hapus legacy MongoDB:** `models/`, `seedReports.js`, `seedFinances.js`, `scratch/`
- **Hapus junk root:** `original_styles.css`, `recovered_styles.css`, `styles_log.json`, `package-lock.json` kosong, `middlewares/` duplikat, `Tara-Icon.png` duplikat di root
- **Hapus dari git:** `favicon.svg`, `icons.svg`, `typescript.svg`, `vite.svg` (tidak dipakai)
- **Fix logo sizing:** Padding konsisten ~11% container, `box-sizing: border-box`, hapus `overflow: hidden` (PNG sudah di-crop)
- **Fix FOUC splash:** Inline `<style>` di `index.html` — splash render benar sebelum JS bundle load
- **Add ke git:** `backend/createAdmin.js`
- **Buat:** `PRD.md` + `AI_CONTEXT.md` (file ini)

### 2026-07-09 · Session 2 — Tara-Icon.png Branding
**Commit:** `75ed1ec`
- Replace semua icon lama (`hub` Material Icon, `shield`) → `Tara-Icon.png`
- Lokasi logo: navbar, footer, admin sidebar, admin login page, splash screen, favicon, PWA manifest
- Setiap logo dalam container: background putih `#ffffff` + `border-radius` + padding
- File: `frontend/public/Tara-Icon.png`

### 2026-07-08 · Session 1 — UI/UX Overhaul
**Commit:** `bf6a908`, `3f3c37f`
- **QRScannerModal.tsx** (warga): Rewrite — full-screen mobile, card 420px desktop, scan laser animasi
- **AdminQRScannerModal.tsx** (admin): Rewrite — column mobile / row desktop, scan line animasi
- **Fix file upload:** Hidden div `"qr-file-scanner-hidden"` + instance `Html5Qrcode` terpisah → upload QR dari galeri berfungsi
- **Fix scan line offset:** `wqs-frame-wrap` dipindah jadi direct sibling `.wqs-camera-bg` bukan nested di flex child
- **Fix glow clipping:** Hapus `overflow: hidden` dari frame container
- **Dasbor.tsx:** Rewrite — `StatCard` + `useCounter` hook, lock overlay blur, identity card, quick actions

### 2026-07-07 · Session 0 — Admin Ecosystem
**Commit:** `6030fd9`
- **Buat:** `ManajemenProduk.tsx` — CRUD produk Pasar (form sticky kiri, list kanan)
- **Fix:** Hardcoded `localhost:5000` di `Kegiatan.tsx` dan `Pasar.tsx` → `getApiBaseUrl()`
- **Update:** `AdminLayout.tsx` — redesign login page (gradient, card, clamped type)
- **Add:** Route `/tara-system/produk` di `App.tsx`
- **Add:** Menu "Produk Pasar" di sidebar admin

### 2026-07-05 · Initial Setup
**Commit:** `a422772`
- Scaffold: React + TS + Vite + Tailwind | Express + Prisma + PostgreSQL
- Prisma schema: 7 model (User, Event, Report, Finance, EventRegistration, Product, AuditLog)
- Auth: QR handshake + JWT + device binding
- Base pages: Home, Kegiatan, Pasar, Lapor, Dasbor
- Admin panel: 6 dashboards + DataWarga + Keuangan + ManajemenKegiatan + ManajemenLaporan + AuditLogs

---

## Panduan Mulai Sesi Baru

1. **Baca file ini** (AI_CONTEXT.md) sebagai konteks dasar
2. **Baca PRD.md** untuk gambaran fitur dan roadmap
3. **Jalankan `git status`** untuk lihat perubahan yang belum di-commit
4. **Jangan hardcode URL** — selalu pakai `getApiBaseUrl()` dari `frontend/src/utils/api.ts`
5. **Untuk ubah schema DB** — edit `prisma/schema.prisma` lalu `npx prisma migrate dev`
6. **Cek `.gitignore`** sebelum `git add` — `.env` dan `mcp.json` tidak boleh masuk commit
7. **Update Changelog di file ini** setiap akhir sesi yang membuat perubahan signifikan
