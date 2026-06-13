const EventEmitter = require('events');
const AuditLog = require('../models/AuditLog');

const auditEvents = new EventEmitter();

auditEvents.on('log', async (data) => {
  try {
    await AuditLog.create({
      action: data.action,
      actor_ucid: data.actor_ucid,
      actor_name: data.actor_name,
      actor_role: data.actor_role,
      ip_address: data.ip_address,
      details: data.details
    });
  } catch (err) {
    console.error('Failed to save audit log:', err.message);
  }
});

const logActivity = (req, action, details = {}) => {
  const user = req.user;
  if (!user) return;

  auditEvents.emit('log', {
    action,
    actor_ucid: user.ucid,
    actor_name: user.nama || 'System',
    actor_role: user.role,
    ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    details
  });
};

module.exports = { logActivity };
