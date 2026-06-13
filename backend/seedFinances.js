require("dotenv").config();
const mongoose = require("mongoose");
const Finance = require("./models/Finance");

const MONGODB_URI = process.env.MONGODB_URI;

const User = require("./models/User");

const jenisIuran = ["Kas Bulanan", "Iuran HUT RI", "Dana Sosial", "Iuran Sampah"];
const statuses = ["Lunas", "Belum Bayar", "Menunggu Verifikasi"];

const seedData = async () => {
  try {
    console.log("⏳ Menghubungkan ke database...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Database terhubung.");

    // Ambil semua user untuk mendapatkan UCID asli
    const users = await User.find();
    if (users.length === 0) {
      console.log("❌ Tidak ada user di database. Silakan jalankan seeder user atau tambah user manual dulu.");
      process.exit(1);
    }

    // Hapus data lama agar bersih
    await Finance.deleteMany({});
    console.log("🗑️  Data lama dibersihkan.");

    const finances = [];

    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const iuran = jenisIuran[Math.floor(Math.random() * jenisIuran.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const nominal = Math.floor(Math.random() * (100000 - 10000 + 1) / 5000) * 5000 + 10000;
      
      const bukti_transfer = status === "Belum Bayar" 
        ? null 
        : `https://placehold.co/600x400/161719/white?text=BUKTI+TRANSFER+${i+1}`;

      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      finances.push({
        ucid: user.ucid, // Menggunakan UCID asli dari koleksi Users
        jenis_iuran: iuran,
        nominal: nominal,
        status: status,
        bukti_transfer: bukti_transfer,
        date: date
      });
    }

    console.log(`🚀 Memasukkan 50 data keuangan...`);
    await Finance.insertMany(finances);
    
    console.log("✨ Berhasil memasukkan 50 data dummy keuangan dengan UCID valid!");
    process.exit();
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat seeding:", err);
    process.exit(1);
  }
};

seedData();
