const crypto = require("crypto");
const prisma = require("../prisma/client");
const { logActivity } = require("../utils/logger");

exports.getAllUsers = async (req, res) => {
  try {
    const where = req.user?.role === "KETUA RT" ? { blok: req.user.blok } : {};
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data warga", error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nama, blok, role } = req.body;
    const targetRole = role || "WARGA";

    if (req.user?.role === "KETUA RT" && ["ADMINISTRATOR", "KETUA RT", "DEVELOPER"].includes(targetRole)) {
      return res.status(403).json({ message: "Akses Ditolak: Anda tidak dapat membuat pengguna dengan role tersebut." });
    }
    if (req.user?.role === "ADMINISTRATOR" && targetRole === "DEVELOPER") {
      return res.status(403).json({ message: "Akses Ditolak: Administrator tidak dapat membuat akun Developer." });
    }

    const year = new Date().getFullYear();
    const lastUser = await prisma.user.findFirst({
      where: { ucid: { startsWith: `TARA-${year}-` } },
      orderBy: { ucid: "desc" },
    });

    let nextNumber = 1;
    if (lastUser) {
      const parts = lastUser.ucid.split("-");
      nextNumber = parseInt(parts[2]) + 1;
    }

    const ucid = `TARA-${year}-${nextNumber.toString().padStart(4, "0")}`;
    const qrToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: { ucid, nama, blok, role: targetRole, qrToken },
    });

    logActivity(req, "CREATE_USER", { target_ucid: ucid, target_name: nama });
    res.status(201).json({ message: "Warga berhasil didaftarkan!", data: newUser });
  } catch (err) {
    res.status(500).json({ message: "Gagal mendaftarkan warga", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nama, blok, role } = req.body;

    if (role) {
      if (req.user?.role === "KETUA RT" && ["ADMINISTRATOR", "KETUA RT", "DEVELOPER"].includes(role)) {
        return res.status(403).json({ message: "Akses Ditolak: Anda tidak dapat mengubah pengguna menjadi role tersebut." });
      }
      if (req.user?.role === "ADMINISTRATOR" && role === "DEVELOPER") {
        return res.status(403).json({ message: "Akses Ditolak: Administrator tidak dapat menugaskan role Developer." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { nama, blok, role },
    });

    logActivity(req, "UPDATE_USER", { target_id: req.params.id, updates: { nama, blok, role } });
    res.json({ message: "Data warga berhasil diperbarui!", data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui warga", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    logActivity(req, "DELETE_USER", { target_id: req.params.id });
    res.json({ message: "Warga berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus warga", error: err.message });
  }
};

exports.regenerateQR = async (req, res) => {
  try {
    const qrToken = crypto.randomBytes(32).toString("hex");
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { qrToken },
    });
    logActivity(req, "REGENERATE_QR", { target_id: req.params.id });
    res.json({ message: "QR Token berhasil diperbarui!", data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Gagal regenerasi token", error: err.message });
  }
};
