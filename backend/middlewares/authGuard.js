const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const deviceId = req.headers["x-device-id"];

    if (!token) {
      return res.status(401).json({ message: "Akses ditolak. Silakan scan QR untuk masuk." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tara_secret_key_2025");

    const user = await prisma.user.findUnique({ where: { ucid: decoded.ucid } });
    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    if (user.isActivated && user.deviceId && user.deviceId !== deviceId) {
      return res.status(403).json({
        message: "Akses ditolak. Perangkat ini tidak terdaftar untuk identitas tersebut.",
      });
    }

    req.user = { ...decoded, nama: user.nama };
    next();
  } catch {
    res.status(401).json({ message: "Sesi kadaluarsa. Silakan scan ulang QR." });
  }
};
