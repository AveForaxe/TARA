const mongoose = require("mongoose");

const FinanceSchema = new mongoose.Schema({
  ucid: {
    type: String,
    required: true,
    ref: "User",
  },
  jenis_iuran: {
    type: String,
    required: true,
  },
  nominal: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Lunas", "Belum Bayar", "Menunggu Verifikasi"],
    default: "Belum Bayar",
  },
  bukti_transfer: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Finance", FinanceSchema);
