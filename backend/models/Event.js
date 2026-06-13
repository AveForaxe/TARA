const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Mendatang", "Selesai", "Dibatalkan"],
    default: "Mendatang",
  },
  proposal_url: {
    type: String,
    default: "",
  },
  proposal_status: {
    type: String,
    enum: ["Menunggu", "Diterima", "Ditolak"],
    default: "Menunggu",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Event", EventSchema);
