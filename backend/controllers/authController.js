const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.handshakeQR = async (req, res) => {
  try {
    const { ucid, token, deviceId } = req.body;

    // 1. Cari warga berdasarkan UCID
    const user = await User.findOne({ ucid });

    if (!user) {
      return res.status(404).json({ message: "Warga tidak terdaftar dalam sistem." });
    }

    // 2. Validasi Secret Token (Data dari QR harus cocok dengan DB)
    if (user.qrToken !== token) {
      return res.status(401).json({ message: "Token QR tidak valid atau sudah kadaluarsa." });
    }

    // 3. Logika Device Binding
    if (!user.isActivated) {
      // Aktivasi pertama kali: Ikat Device ID ke User
      user.deviceId = deviceId;
      user.isActivated = true;
      await user.save();
    } else {
      // Sudah aktif: Cek apakah Device ID cocok
      if (user.deviceId !== deviceId) {
        return res.status(403).json({
          message: "Akses ditolak. Perangkat ini tidak terdaftar untuk identitas tersebut.",
        });
      }
    }

    // 4. Generate JWT Session
    const jwtToken = jwt.sign(
      { id: user._id, ucid: user.ucid, role: user.role, blok: user.blok },
      process.env.JWT_SECRET || "tara_secret_key_2025",
      { expiresIn: "30d" } // Long-lived session sesuai PRD
    );

    res.json({
      message: "Handshake berhasil. Akses dibuka.",
      token: jwtToken,
      user: {
        nama: user.nama,
        role: user.role,
        ucid: user.ucid,
        blok: user.blok,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan sistem.", error: err.message });
  }
};
