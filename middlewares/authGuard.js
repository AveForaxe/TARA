const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Akses ditolak. Silakan scan QR untuk masuk." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tara_secret_key_2025");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Sesi kadaluarsa. Silakan scan ulang QR." });
  }
};
