require("dotenv").config();
const mongoose = require("mongoose");
const Report = require("./models/Report");

const MONGODB_URI = process.env.MONGODB_URI;

const User = require("./models/User");

const categories = [
  { 
    name: "Keamanan", 
    titles: ["Lampu jalan mati", "Ada orang mencurigakan", "Portal tidak dikunci", "CCTV mati"] 
  },
  { 
    name: "Kebersihan", 
    titles: ["Sampah menumpuk", "Selokan mampet", "Rumput liar panjang", "Bau tidak sedap"] 
  },
  { 
    name: "Infrastruktur", 
    titles: ["Jalan berlubang", "Pipa bocor", "Tembok retak", "Paving blok lepas"] 
  },
  { 
    name: "Lainnya", 
    titles: ["Kebisingan", "Parkir sembarangan", "Hewan liar", "Pesta larut malam"] 
  }
];

const statuses = ["Menunggu", "Diproses", "Ditindaklanjuti", "Selesai"];
const locations = ["Blok A", "Blok B", "Blok C", "Taman Bermain", "Pos Satpam", "Pintu Masuk Utama"];

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

    // Bersihkan laporan lama
    await Report.deleteMany({});
    console.log("🗑️  Laporan lama dibersihkan.");

    const reports = [];

    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const title = category.titles[Math.floor(Math.random() * category.titles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      reports.push({
        reporter_ucid: user.ucid, // Menggunakan UCID asli
        category: category.name,
        title: title,
        description: `Mohon ditindaklanjuti terkait ${title.toLowerCase()} di area ini agar lingkungan tetap nyaman.`,
        location: location,
        status: status,
        photoUrl: `https://placehold.co/600x400/161719/white?text=LAPORAN+${i+1}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
      });
    }

    console.log("🚀 Memasukkan 20 data laporan...");
    await Report.insertMany(reports);
    
    console.log("✨ Berhasil memasukkan 20 data dummy laporan dengan UCID valid!");
    process.exit();
  } catch (err) {
    console.error("❌ Kesalahan saat seeding laporan:", err);
    process.exit(1);
  }
};

seedData();
