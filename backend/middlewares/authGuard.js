const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const deviceId = req.headers["x-device-id"]; // Fingerprint dari frontend

    if (!token) {
      return res.status(401).json({ message: "Akses ditolak. Silakan scan QR untuk masuk." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tara_secret_key_2025");
    
    // Validasi Perangkat (Device Binding)
    const user = await User.findOne({ ucid: decoded.ucid });
    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    // Jika user sudah diaktivasi, cek apakah Device ID cocok
    if (user.isActivated && user.deviceId && user.deviceId !== deviceId) {
      return res.status(403).json({ 
        message: "Akses ditolak. Perangkat ini tidak terdaftar untuk identitas tersebut." 
      });
    }

    decoded.nama = user.nama;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Sesi kadaluarsa. Silakan scan ulang QR." });
  }
};
