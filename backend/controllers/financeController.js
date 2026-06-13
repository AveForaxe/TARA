const Finance = require("../models/Finance");
const { logActivity } = require("../utils/logger");

exports.getAllFinances = async (req, res) => {
  try {
    const finances = await Finance.find().sort({ date: -1 });
    res.json(finances);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data keuangan", error: err.message });
  }
};

exports.createFinance = async (req, res) => {
  try {
    const { ucid, jenis_iuran, nominal, status } = req.body;
    const newFinance = new Finance({ ucid, jenis_iuran, nominal, status });
    await newFinance.save();
    logActivity(req, "Tambah Data Iuran", { ucid, nominal, jenis_iuran });
    res.status(201).json({ message: "Data iuran berhasil ditambahkan!", data: newFinance });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan data keuangan", error: err.message });
  }
};

exports.updateFinanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Finance.findByIdAndUpdate(req.params.id, { status }, { new: true });
    logActivity(req, "Update Status Iuran", { id: req.params.id, status });
    res.json({ message: "Status iuran diperbarui!", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui iuran", error: err.message });
  }
};

exports.deleteFinance = async (req, res) => {
  try {
    await Finance.findByIdAndDelete(req.params.id);
    logActivity(req, "Hapus Data Iuran", { id: req.params.id });
    res.json({ message: "Data iuran dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
};
