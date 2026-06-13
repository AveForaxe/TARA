const Report = require("../models/Report");
const User = require("../models/User");
const { logActivity } = require("../utils/logger");

exports.createReport = async (req, res) => {
  try {
    const { category, title, description, location } = req.body;
    const newReport = new Report({
      reporter_ucid: req.user.ucid,
      category,
      title,
      description,
      location,
    });
    await newReport.save();
    logActivity(req, "Buat Laporan", { title, category });
    res.status(201).json({ message: "Laporan berhasil disimpan!", data: newReport });
  } catch (err) {
    res.status(500).json({ message: "Gagal menyimpan laporan", error: err.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter_ucid: req.user.ucid }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil laporan Anda", error: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    let reports = await Report.find().sort({ createdAt: -1 });
    
    if (req.user && req.user.role === "KETUA RT") {
      const usersInBlok = await User.find({ blok: req.user.blok }).select('ucid');
      const ucidsInBlok = usersInBlok.map(u => u.ucid);
      reports = reports.filter(r => ucidsInBlok.includes(r.reporter_ucid));
    }
    
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data laporan", error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    logActivity(req, "Update Status Laporan", { id: req.params.id, status });
    res.json({ message: "Status laporan berhasil diperbarui!", data: updatedReport });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui laporan", error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    logActivity(req, "Hapus Laporan", { id: req.params.id });
    res.json({ message: "Laporan berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus laporan", error: err.message });
  }
};
