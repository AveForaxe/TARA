const prisma = require("../prisma/client");
const { logActivity } = require("../utils/logger");

exports.createReport = async (req, res) => {
  try {
    const { category, title, description, location } = req.body;
    const newReport = await prisma.report.create({
      data: {
        reporter_ucid: req.user.ucid,
        category,
        title,
        description,
        location,
      },
    });
    logActivity(req, "Buat Laporan", { title, category });
    res.status(201).json({ message: "Laporan berhasil disimpan!", data: newReport });
  } catch (err) {
    res.status(500).json({ message: "Gagal menyimpan laporan", error: err.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { reporter_ucid: req.user.ucid },
      orderBy: { createdAt: "desc" },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil laporan Anda", error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const where =
      req.user?.role === "KETUA RT"
        ? { reporter: { blok: req.user.blok } }
        : {};

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data laporan", error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedReport = await prisma.report.update({
      where: { id: req.params.id },
      data: { status },
    });
    logActivity(req, "Update Status Laporan", { id: req.params.id, status });
    res.json({ message: "Status laporan berhasil diperbarui!", data: updatedReport });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui laporan", error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await prisma.report.delete({ where: { id: req.params.id } });
    logActivity(req, "Hapus Laporan", { id: req.params.id });
    res.json({ message: "Laporan berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus laporan", error: err.message });
  }
};
