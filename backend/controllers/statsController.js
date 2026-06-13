const User = require("../models/User");
const Report = require("../models/Report");
const Event = require("../models/Event");
const Finance = require("../models/Finance");

exports.getStats = async (req, res) => {
  try {
    const totalWarga = await User.countDocuments();
    const totalLaporan = await Report.countDocuments();
    const laporanAktif = await Report.countDocuments({ status: { $ne: "Selesai" } });
    const eventMendatang = await Event.countDocuments({ status: "Mendatang" });
    const eventSelesai = await Event.countDocuments({ status: "Selesai" });
    const proposalPending = await Event.countDocuments({ proposal_status: "Menunggu" });
    
    // Keuangan
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const allLunas = await Finance.find({ status: "Lunas" });
    
    // Pemasukan = selain Pengeluaran
    const pemasukanBulanIni = allLunas.filter(f => f.jenis_iuran !== "Pengeluaran" && f.date >= firstDayOfMonth && f.date <= lastDayOfMonth);
    const kasBulanIni = pemasukanBulanIni.reduce((acc, curr) => acc + curr.nominal, 0);
    
    // Pengeluaran
    const pengeluaranBulanIniArr = allLunas.filter(f => f.jenis_iuran === "Pengeluaran" && f.date >= firstDayOfMonth && f.date <= lastDayOfMonth);
    const pengeluaranBulanIni = pengeluaranBulanIniArr.reduce((acc, curr) => acc + curr.nominal, 0);
    
    // Total Saldo (Pemasukan - Pengeluaran)
    const totalPemasukan = allLunas.filter(f => f.jenis_iuran !== "Pengeluaran").reduce((acc, curr) => acc + curr.nominal, 0);
    const totalPengeluaran = allLunas.filter(f => f.jenis_iuran === "Pengeluaran").reduce((acc, curr) => acc + curr.nominal, 0);
    const totalSaldo = totalPemasukan - totalPengeluaran;

    // Asumsi: Warga yang bayar bulan ini = jumlah unik UCID di pemasukanBulanIni
    const wargaSudahBayar = new Set(pemasukanBulanIni.map(f => f.ucid)).size;
    const wargaBelumBayar = Math.max(0, totalWarga - wargaSudahBayar);

    const totalAdmin = await User.countDocuments({ role: "ADMINISTRATOR" });
    const totalRT = await User.countDocuments({ role: "KETUA RT" });
    const totalKT = await User.countDocuments({ role: "KARANG TARUNA" });
    const totalWargaBiasa = await User.countDocuments({ role: "WARGA" });

    res.json({
      // Admin General
      totalWarga, totalLaporan, kasBulanIni, eventMendatang,
      
      // Developer
      developer: {
        totalAdmin,
        totalRT,
        totalKT,
        totalWargaBiasa
      },
      
      // Keuangan
      keuangan: {
        totalSaldo,
        iuranBulanIni: kasBulanIni,
        pengeluaranBulanIni,
        wargaBelumBayar
      },
      
      // Karang Taruna
      karang_taruna: {
        eventAktif: eventMendatang,
        totalPeserta: eventSelesai * 25, // Estimasi peserta
        proposalPending,
        danaKegiatan: totalSaldo * 0.2 // Asumsi 20% saldo untuk kegiatan
      },

      // RT
      rt: {
        totalWarga,
        eventMendatang,
        proposalPending,
        laporanAktif
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil log", error: err.message });
  }
};
