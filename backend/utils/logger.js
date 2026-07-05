const prisma = require("../prisma/client");

const logActivity = (req, action, details = {}) => {
  const user = req.user;
  if (!user) return;

  prisma.auditLog
    .create({
      data: {
        action,
        actor_ucid: user.ucid,
        actor_name: user.nama || "System",
        actor_role: user.role,
        ip_address: req.ip || req.headers["x-forwarded-for"] || "",
        details,
      },
    })
    .catch((err) => console.error("Failed to save audit log:", err.message));
};

module.exports = { logActivity };
