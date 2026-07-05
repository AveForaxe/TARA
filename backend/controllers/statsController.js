const prisma = require("../prisma/client");

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalWarga,
      totalLaporan,
      laporanAktif,
      eventMendatang,
      eventSelesai,
      proposalPending,
      totalAdmin,
      totalRT,
      totalKT,
      totalWargaBiasa,
      sumPemasukanTotal,
      sumPengeluaranTotal,
      sumPemasukanBulanIni,
      sumPengeluaranBulanIni,
      wargaSudahBayarBulanIni,
      totalRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: { not: "Selesai" } } }),
      prisma.event.count({ where: { status: "Mendatang" } }),
      prisma.event.count({ where: { status: "Selesai" } }),
      prisma.event.count({ where: { proposal_status: "Menunggu" } }),
      prisma.user.count({ where: { role: "ADMINISTRATOR" } }),
      prisma.user.count({ where: { role: "KETUA RT" } }),
      prisma.user.count({ where: { role: "KARANG TARUNA" } }),
      prisma.user.count({ where: { role: "WARGA" } }),
      prisma.finance.aggregate({
        where: { status: "Lunas", jenis_iuran: { not: "Pengeluaran" } },
        _sum: { nominal: true },
      }),
      prisma.finance.aggregate({
        where: { status: "Lunas", jenis_iuran: "Pengeluaran" },
        _sum: { nominal: true },
      }),
      prisma.finance.aggregate({
        where: {
          status: "Lunas",
          jenis_iuran: { not: "Pengeluaran" },
          date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        _sum: { nominal: true },
      }),
      prisma.finance.aggregate({
        where: {
          status: "Lunas",
          jenis_iuran: "Pengeluaran",
          date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        _sum: { nominal: true },
      }),
      prisma.finance.findMany({
        where: {
          status: "Lunas",
          jenis_iuran: { not: "Pengeluaran" },
          date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        select: { ucid: true },
        distinct: ["ucid"],
      }),
      prisma.eventRegistration.count(),
    ]);

    const totalPemasukan = sumPemasukanTotal._sum.nominal || 0;
    const totalPengeluaran = sumPengeluaranTotal._sum.nominal || 0;
    const totalSaldo = totalPemasukan - totalPengeluaran;
    const kasBulanIni = sumPemasukanBulanIni._sum.nominal || 0;
    const pengeluaranBulanIni = sumPengeluaranBulanIni._sum.nominal || 0;
    const wargaSudahBayar = wargaSudahBayarBulanIni.length;
    const wargaBelumBayar = Math.max(0, totalWarga - wargaSudahBayar);

    res.json({
      totalWarga,
      totalLaporan,
      kasBulanIni,
      eventMendatang,

      developer: { totalAdmin, totalRT, totalKT, totalWargaBiasa },

      keuangan: {
        totalSaldo,
        iuranBulanIni: kasBulanIni,
        pengeluaranBulanIni,
        wargaBelumBayar,
      },

      karang_taruna: {
        eventAktif: eventMendatang,
        totalPeserta: totalRegistrations,
        proposalPending,
        danaKegiatan: totalSaldo * 0.2,
      },

      rt: { totalWarga, eventMendatang, proposalPending, laporanAktif },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil log", error: err.message });
  }
};
