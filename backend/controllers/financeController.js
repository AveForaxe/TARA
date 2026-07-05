const prisma = require("../prisma/client");
const { logActivity } = require("../utils/logger");

exports.getAllFinances = async (req, res) => {
  try {
    const finances = await prisma.finance.findMany({ orderBy: { date: "desc" } });
    res.json(finances);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data keuangan", error: err.message });
  }
};

exports.createFinance = async (req, res) => {
  try {
    const { ucid, jenis_iuran, nominal, status } = req.body;
    const newFinance = await prisma.finance.create({
      data: { ucid, jenis_iuran, nominal: parseFloat(nominal), status },
    });
    logActivity(req, "Tambah Data Iuran", { ucid, nominal, jenis_iuran });
    res.status(201).json({ message: "Data iuran berhasil ditambahkan!", data: newFinance });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan data keuangan", error: err.message });
  }
};

exports.updateFinanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.finance.update({
      where: { id: req.params.id },
      data: { status },
    });
    logActivity(req, "Update Status Iuran", { id: req.params.id, status });
    res.json({ message: "Status iuran diperbarui!", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui iuran", error: err.message });
  }
};

exports.deleteFinance = async (req, res) => {
  try {
    await prisma.finance.delete({ where: { id: req.params.id } });
    logActivity(req, "Hapus Data Iuran", { id: req.params.id });
    res.json({ message: "Data iuran dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
};
