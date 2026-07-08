/**
 * Script: createAdmin.js
 * Jalankan: node createAdmin.js
 *
 * Membuat user DEVELOPER di database dan menghasilkan file QR HTML
 * yang bisa dibuka di browser lalu discan untuk login admin.
 */

require("dotenv").config();
const prisma = require("./prisma/client");
const fs = require("fs");
const path = require("path");

// ── Konfigurasi ──────────────────────────────────────────────────────────────
const ADMIN_DATA = {
  nama:  "Developer Admin",
  blok:  "RT00",
  role:  "DEVELOPER",
  ucid:  "TARA-2025-0001",
  qrToken: "dev-token-" + Math.random().toString(36).slice(2, 10),
};
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔧  TARA — Create Admin Script\n");

  // Cek apakah UCID sudah ada
  const existing = await prisma.user.findUnique({ where: { ucid: ADMIN_DATA.ucid } });

  let user;
  if (existing) {
    // Reset token dan deviceId supaya bisa login ulang dari device baru
    user = await prisma.user.update({
      where: { ucid: ADMIN_DATA.ucid },
      data: {
        qrToken:     ADMIN_DATA.qrToken,
        deviceId:    null,
        isActivated: false,
      },
    });
    console.log("♻️   User sudah ada — token dan device direset.");
  } else {
    user = await prisma.user.create({
      data: {
        ucid:        ADMIN_DATA.ucid,
        nama:        ADMIN_DATA.nama,
        blok:        ADMIN_DATA.blok,
        role:        ADMIN_DATA.role,
        qrToken:     ADMIN_DATA.qrToken,
        isActivated: false,
      },
    });
    console.log("✅  User baru berhasil dibuat.");
  }

  const qrPayload = JSON.stringify({ ucid: user.ucid, token: user.qrToken });

  // QR di-generate di browser via qrcodejs (CDN) — tidak butuh internet khusus
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>QR Admin — ${user.nama}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #070B14; color: #fff; font-family: system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #111214; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; text-align: center; max-width: 420px; width: 90%; }
    h1 { font-size: 1.4rem; margin-bottom: 4px; }
    .sub { color: #6b7280; font-size: 0.85rem; margin-bottom: 28px; }
    .qr-wrap { background: #fff; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 8px; }
    #qrcode canvas, #qrcode img { display: block; }
    .btn-save { margin: 12px 0 20px; background: #1d4ed8; color: #fff; border: none; border-radius: 10px; padding: 10px 24px; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
    .btn-save:hover { background: #2563eb; }
    .info { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 10px; padding: 14px; text-align: left; font-size: 0.8rem; line-height: 1.8; }
    .label { color: #6b7280; }
    .val { color: #e5e7eb; font-weight: 600; }
    .badge { display: inline-block; background: #3b82f6; color: #fff; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px; padding: 3px 8px; border-radius: 6px; }
    .warn { margin-top: 20px; font-size: 0.72rem; color: #ef4444; background: rgba(239,68,68,0.08); padding: 10px 14px; border-radius: 8px; }
    .steps { margin-top: 16px; font-size: 0.78rem; color: #9ca3af; text-align: left; line-height: 2; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔐 QR Identity Admin</h1>
    <p class="sub">Buka <strong>localhost:5173/tara-system</strong> → klik UNGGAH QR → pilih file ini</p>

    <div class="qr-wrap">
      <div id="qrcode"></div>
    </div>
    <br>
    <button class="btn-save" onclick="saveQR()">💾 Simpan sebagai Gambar PNG</button>

    <div class="info">
      <div><span class="label">Nama: </span><span class="val">${user.nama}</span></div>
      <div><span class="label">UCID: </span><span class="val">${user.ucid}</span></div>
      <div><span class="label">Blok: </span><span class="val">${user.blok}</span></div>
      <div><span class="label">Role: </span><span class="badge">${user.role}</span></div>
    </div>

    <div class="steps">
      <strong style="color:#fff">Cara pakai:</strong><br>
      1. Klik "Simpan sebagai Gambar PNG"<br>
      2. Buka <code>localhost:5173/tara-system</code><br>
      3. Klik tombol <strong>UNGGAH QR</strong><br>
      4. Pilih file PNG yang sudah disimpan
    </div>

    <p class="warn">⚠️ Jangan bagikan file ini. Hapus setelah berhasil login.</p>
  </div>

  <script>
    const payload = ${JSON.stringify(qrPayload)};
    const qr = new QRCode(document.getElementById("qrcode"), {
      text: payload,
      width: 280,
      height: 280,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    function saveQR() {
      // Tunggu QR selesai render
      setTimeout(() => {
        const canvas = document.querySelector("#qrcode canvas");
        if (!canvas) { alert("QR belum siap, tunggu sebentar lalu coba lagi."); return; }
        const link = document.createElement("a");
        link.download = "tara-admin-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }, 300);
    }
  <\/script>
</body>
</html>`;

  const outputPath = path.join(__dirname, "admin_qr.html");
  fs.writeFileSync(outputPath, htmlContent, "utf8");

  console.log("\n📋  Data user:");
  console.log(`    Nama  : ${user.nama}`);
  console.log(`    UCID  : ${user.ucid}`);
  console.log(`    Role  : ${user.role}`);
  console.log(`    Token : ${user.qrToken}`);
  console.log(`\n📄  File QR dibuat: backend/admin_qr.html`);
  console.log("    Buka file tersebut di browser, lalu scan QR-nya di /tara-system\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
