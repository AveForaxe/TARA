const prisma = require("../prisma/client");

exports.registerForEvent = async (req, res) => {
  try {
    const { nama, phone, alamat, ucid } = req.body;
    const eventId = req.params.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: "Kegiatan tidak ditemukan." });
    }
    if (event.status !== "Mendatang") {
      return res.status(400).json({ message: "Kegiatan ini sudah tidak menerima pendaftaran." });
    }

    const existing = ucid
      ? await prisma.eventRegistration.findFirst({ where: { event_id: eventId, ucid } })
      : null;

    if (existing) {
      return res.status(400).json({ message: "Anda sudah terdaftar untuk kegiatan ini." });
    }

    const registration = await prisma.eventRegistration.create({
      data: { event_id: eventId, nama, phone, alamat, ucid: ucid || null },
    });

    res.status(201).json({
      message: "Pendaftaran berhasil! Sampai jumpa di kegiatan.",
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mendaftar kegiatan.", error: err.message });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { event_id: req.params.id },
      orderBy: { registeredAt: "desc" },
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data pendaftar.", error: err.message });
  }
};
