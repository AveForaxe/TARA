module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Sesi tidak valid." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini." 
      });
    }

    next();
  };
};
