=====================================================
PRODUCT REQUIREMENTS DOCUMENT (PRD) - FASE 3
PROJEK: TARA DIGITAL HUB (KARANG TARUNA)
STATUS: INTEGRATED ADMIN ECOSYSTEM & TRANSPARENCY LOG
=====================================================

1. STANDAR VISUAL & UI/UX (GLOBAL DNA)
-----------------------------------------------------
Semua dashboard (Developer, Admin, Keuangan, KT, RT) wajib 
menggunakan DNA desain yang seragam agar konsisten:

- Palet Warna: Deep Navy (#000814), Pure Black (#000000), 
  White (#FFFFFF), dan aksen Muted Rose Pink (#D896A7).
- Efek Glassmorphism: 
  * Backdrop-blur: 15px.
  * Background: rgba(255, 255, 255, 0.05).
  * Border: 1px solid rgba(255, 255, 255, 0.1).
- Layout: Form input selalu di sisi KIRI (Sticky), 
  Data/Tabel di sisi KANAN.

2. DASHBOARD DEVELOPER (MASTER CONTROL)
-----------------------------------------------------
Pusat kendali untuk monitoring sistem secara menyeluruh.
- Widget Statistik (Rincian Pengguna):
  * Total Administrator: Menampilkan nama & status aktif.
  * Total Ketua RT: Menampilkan jumlah & status aktif.
  * Total Karang Taruna: Menampilkan jumlah & status aktif.
  * Total Warga Biasa: Angka total populasi.
- Global Audit Log: Feed real-time yang menampilkan semua 
  aktivitas dari seluruh role pengurus tanpa terkecuali.

3. DASHBOARD SPESIFIK ROLE (FUNCTIONAL)
-----------------------------------------------------
Setiap dashboard memiliki "Aktivitas Terkini" yang mencatat 
log masing-masing user:

A. Dashboard Admin:
   - Fokus: Manajemen data warga, cetak QR, reset device binding.
   - Log: Mencatat aktivitas input data/reset QR.

B. Dashboard Keuangan:
   - Fokus: Input iuran, laporan kas, validasi bukti transfer.
   - UI: Form input iuran di KIRI, daftar transaksi di KANAN.
   - Log: Mencatat setiap transaksi yang diinput/divalidasi.

C. Dashboard Karang Taruna:
   - Fokus: Manajemen event, upload proposal, cek pendaftar.
   - Log: Mencatat pembuatan event atau perubahan status lomba.

D. Dashboard Ketua RT:
   - Fokus: Validasi laporan warga & persetujuan proposal KT.
   - Log: Mencatat setiap persetujuan atau tanggapan laporan.

4. UI/UX DINAMIS & SISTEM LAPORAN
-----------------------------------------------------
A. Dynamic Language System:
   - Button tindakan tidak boleh statis. Label harus berubah 
     sesuai role yang sedang login.
     * Contoh: "Verifikasi oleh Developer" (jika role Developer).
     * Contoh: "Divalidasi oleh Keuangan" (jika role Keuangan).
     * Contoh: "Disetujui oleh Ketua RT" (jika role Ketua RT).

B. Layouting Ulang:
   - Menstandarisasi semua form input (Keuangan, Event, Lapor) 
     agar tetap di sisi KIRI mengikuti template utama.

5. SISTEM LOG TRANSPARANSI (THE BACKBONE)
-----------------------------------------------------
Sistem wajib mencatat aktivitas secara presisi untuk 
transparansi dan audit:

- Data yang Dicatat:
  * Timestamp: Tanggal, jam, menit, detik, milidetik.
  * Identitas: Nama User + Role (Contoh: "Budi - Keuangan").
  * Tindakan: Deskripsi aktivitas (Contoh: "Input Iuran C1").
  * Metadata: Info perangkat atau IP jika diperlukan.

- Visibilitas:
  * Log individu tampil di dashboard role masing-masing