const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  ucid: {
    type: String,
    required: true,
    unique: true, // Unique Citizen ID
  },
  nama: {
    type: String,
    required: true,
  },
  blok: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["DEVELOPER", "ADMINISTRATOR", "KEUANGAN", "KARANG TARUNA", "KETUA RT", "WARGA"],
    default: "WARGA",
  },
  deviceId: {
    type: String, // Fingerprint perangkat
    default: null,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  qrToken: {
    type: String, // Token rahasia di dalam QR
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
