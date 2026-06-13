const User = require("../models/User");
const crypto = require("crypto");
const { logActivity } = require("../utils/logger");

exports.getAllUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role === "KETUA RT") {
      query = { blok: req.user.blok };
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data warga", error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nama, blok, role } = req.body;
    const targetRole = role || "WARGA";

    // Validasi Hierarchy Role
    if (req.user && req.user.role === "KETUA RT" && ["ADMINISTRATOR", "KETUA RT", "DEVELOPER"].includes(targetRole)) {
      return res.status(403).json({ message: "Akses Ditolak: Anda tidak dapat membuat pengguna dengan role tersebut." });
    }
    if (req.user && req.user.role === "ADMINISTRATOR" && targetRole === "DEVELOPER") {
      return res.status(403).json({ message: "Akses Ditolak: Administrator tidak dapat membuat akun Developer." });
    }
    // Generate UCID unik (Cari yang terakhir dan +1, bukan countDocuments)
    const lastUser = await User.findOne({ ucid: new RegExp(`^TARA-${new Date().getFullYear()}-`) })
      .sort({ ucid: -1 });
    
    let nextNumber = 1;
    if (lastUser) {
      const lastUcidParts = lastUser.ucid.split("-");
      nextNumber = parseInt(lastUcidParts[2]) + 1;
    }
    
    const ucid = `TARA-${new Date().getFullYear()}-${nextNumber.toString().padStart(4, "0")}`;
    
    // Generate Token Rahasia untuk QR
    const qrToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      ucid,
      nama,
      blok,
      role: role || "WARGA",
      qrToken,
    });

    await newUser.save();
    logActivity(req, "CREATE_USER", { target_ucid: ucid, target_name: nama });
    res.status(201).json({ message: "Warga berhasil didaftarkan!", data: newUser });
  } catch (err) {
    res.status(500).json({ message: "Gagal mendaftarkan warga", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nama, blok, role } = req.body;

    // Hierarchy Role validation for updates
    if (role) {
      if (req.user && req.user.role === "KETUA RT" && ["ADMINISTRATOR", "KETUA RT", "DEVELOPER"].includes(role)) {
        return res.status(403).json({ message: "Akses Ditolak: Anda tidak dapat mengubah pengguna menjadi role tersebut." });
      }
      if (req.user && req.user.role === "ADMINISTRATOR" && role === "DEVELOPER") {
        return res.status(403).json({ message: "Akses Ditolak: Administrator tidak dapat menugaskan role Developer." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nama, blok, role },
      { new: true }
    );
    logActivity(req, "UPDATE_USER", { target_id: req.params.id, updates: { nama, blok, role } });
    res.json({ message: "Data warga berhasil diperbarui!", data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui warga", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    logActivity(req, "DELETE_USER", { target_id: req.params.id });
    res.json({ message: "Warga berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus warga", error: err.message });
  }
};

exports.regenerateQR = async (req, res) => {
  try {
    const qrToken = crypto.randomBytes(32).toString("hex");
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { qrToken },
      { new: true }
    );
    logActivity(req, "REGENERATE_QR", { target_id: req.params.id });
    res.json({ message: "QR Token berhasil diperbarui!", data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Gagal regenerasi token", error: err.message });
  }
};
