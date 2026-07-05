const prisma = require("../prisma/client");
const { logActivity } = require("../utils/logger");

exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data kegiatan", error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, date, description, location, proposal_url, proposal_status, status } = req.body;
    const newEvent = await prisma.event.create({
      data: { title, date, description, location, proposal_url, proposal_status, status },
    });
    logActivity(req, "Buat Event Baru", { title, date });
    res.status(201).json({ message: "Kegiatan berhasil ditambahkan!", data: newEvent });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan kegiatan", error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { title, date, description, location, proposal_url, proposal_status, status } = req.body;
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { title, date, description, location, proposal_url, proposal_status, status },
    });
    logActivity(req, "Update Event", { id: req.params.id, title: updated.title });
    res.json({ message: "Kegiatan diperbarui!", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui kegiatan", error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    logActivity(req, "Hapus Event", { id: req.params.id });
    res.json({ message: "Kegiatan berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus kegiatan", error: err.message });
  }
};
