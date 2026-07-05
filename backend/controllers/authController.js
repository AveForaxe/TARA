const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

exports.handshakeQR = async (req, res) => {
  try {
    const { ucid, token, deviceId } = req.body;

    const user = await prisma.user.findUnique({ where: { ucid } });

    if (!user) {
      return res.status(404).json({ message: "Warga tidak terdaftar dalam sistem." });
    }

    if (user.qrToken !== token) {
      return res.status(401).json({ message: "Token QR tidak valid atau sudah kadaluarsa." });
    }

    if (!user.isActivated) {
      await prisma.user.update({
        where: { ucid },
        data: { deviceId, isActivated: true },
      });
    } else {
      if (user.deviceId !== deviceId) {
        return res.status(403).json({
          message: "Akses ditolak. Perangkat ini tidak terdaftar untuk identitas tersebut.",
        });
      }
    }

    const jwtToken = jwt.sign(
      { id: user.id, ucid: user.ucid, role: user.role, blok: user.blok },
      process.env.JWT_SECRET || "tara_secret_key_2025",
      { expiresIn: "30d" }
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
