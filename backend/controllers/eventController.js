const Event = require("../models/Event");
const { logActivity } = require("../utils/logger");

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data kegiatan", error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, date, description, location, proposal_url, proposal_status, status } = req.body;
    const newEvent = new Event({ title, date, description, location, proposal_url, proposal_status, status });
    await newEvent.save();
    logActivity(req, "Buat Event Baru", { title, date });
    res.status(201).json({ message: "Kegiatan berhasil ditambahkan!", data: newEvent });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan kegiatan", error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    logActivity(req, "Update Event", { id: req.params.id, title: updated.title });
    res.json({ message: "Kegiatan diperbarui!", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui kegiatan", error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    logActivity(req, "Hapus Event", { id: req.params.id });
    res.json({ message: "Kegiatan berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus kegiatan", error: err.message });
  }
};
