const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  actor_ucid: {
    type: String,
    required: true,
  },
  actor_name: {
    type: String,
  },
  actor_role: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip_address: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
