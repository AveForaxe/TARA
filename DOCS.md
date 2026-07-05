# Product Requirements Document (PRD): Karang Taruna (TARA)

## 1. Vision & Purpose
Membangun platform digital terintegrasi untuk Karang Taruna (TARA) yang berfungsi sebagai jembatan antara kebutuhan warga (fisik) dan solusi teknologi (digital). Platform ini mengedepankan efisiensi birokrasi melalui sistem QR Code dan pemberdayaan ekonomi lokal.

## 2. Tech Stack & Aesthetic
- **Backend:** Node.js dengan framework Antigravity untuk performa tinggi dan logic yang bersih.
- **Database:** MongoDB (Schema-less) untuk fleksibilitas data warga dan event.
- **Frontend:** React.js (Vite) + Tailwind CSS untuk styling yang cepat dan responsif.
- **UI System:** Stitch sebagai fondasi komponen antarmuka.
- **Design Style:** Clean Visionary & Glassmorphism (Dark mode default, Navy/Black base, Muted Pink accent). Blurred transparency, minimalist, high contrast.

## 3. Functional Requirements

### A. Core Event & Dynamic QR System
- **Admin Event Creator:** Dashboard untuk input detail lomba (HUT RI), deskripsi, kuota, dan jadwal.
- **Automated QR Generator:** Sistem otomatis menghasilkan QR Code unik setiap kali event baru dibuat.
- **One-Scan Registration:** QR Code pada poster fisik akan mengarahkan warga langsung ke halaman pendaftaran.
- **Digital Participant Card:** Peserta yang sukses mendaftar menerima kartu digital berisi QR Code unik untuk verifikasi lapangan.

### B. Citizen Services (TARA Hub)
- **TARA-Market (UMKM Katalog):** Ruang bagi warga komplek untuk memajang produk atau jasa.
- **Citizen Issue Tracker:** Form bagi warga melaporkan masalah lingkungan (lampu jalan, dsb) dengan status pelacakan real-time.
- **Digital Inventory:** Sistem peminjaman aset RT/RW (tenda, kursi) dengan jadwal transparan.
- **Dual Mode:** Mendukung Dark Mode (default) dan White Mode dengan bahasa Indonesia yang ramah warga.

### C. Panitia Dashboard (Mobile-Optimized)
- **Mobile Scanner:** Dashboard ringan untuk panitia (anak SMP) agar bisa check-in peserta via scan QR HP.
- **Real-time Analytics:** Dashboard sederhana melihat jumlah pendaftar dan statistik kehadiran.

## 4. Project Structure & Architecture
```plaintext
tara-digital-hub/
├── backend/ (Antigravity & Node.js)
│   ├── controllers/      # Logika API (Event, Registrasi, Report)
│   ├── models/           # Schema Mongoose (MongoDB Collections)
│   ├── routes/           # Definisi endpoint API
│   ├── services/         # QR Generator & PDF Service
│   └── config/           # Koneksi DB & Environment Variables
├── frontend/ (React + Tailwind + Stitch)
│   ├── src/
│   │   ├── components/   # Reusable UI (GlassCard, Navbar, Button)
│   │   ├── hooks/        # Custom hooks (useTheme, useCounter)
│   │   ├── pages/        # Home, Kegiatan, Pasar, Lapor, Dasbor
│   │   ├── context/      # ThemeContext
│   │   └── assets/       
│   ├── vite.config.ts    # Config Vite
│   └── tsconfig.json     # Config TypeScript
└── DOCS.md               # Asset PRD & Panduan
```

### Data Schema (MongoDB)
- **Events:** Info lomba, kuota, tanggal, metadata QR.
- **Registrations:** Data pendaftar, relasi ke Events, status check-in.
- **Citizens:** Data warga.
- **Marketplace:** Katalog produk UMKM.
- **Reports:** Data keluhan warga dan status tindak lanjutnya.

## 5. UI/UX Principles (The "Stitch" Way)
- **Glassmorphism:** Efek frosted glass dengan `backdrop-blur` 15px pada kartu informasi.
- **Clean Visionary:** Layout lega (whitespace luas), font Inter modern, navigasi intuitif.
- **Borders:** Garis tipis 1px pemisah elegan (#FFFFFF untuk dark, #001F3F untuk light).
- **Consistency:** Border-radius konsisten pada 16px.
- **Mobile First:** Optimasi penuh untuk akses lapangan.

## 6. Success Metrics
- **Zero Paper:** Pendaftaran HUT RI ke-81 dilakukan 100% digital.
- **Fast Check-in:** Verifikasi lapangan di bawah 5 detik per orang.
- **Engagement:** Minimal 5 UMKM warga aktif di bulan pertama.
