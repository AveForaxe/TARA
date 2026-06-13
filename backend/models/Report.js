const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reporter_ucid: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
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
  photoUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["Menunggu", "Diproses", "Ditindaklanjuti", "Selesai"],
    default: "Menunggu",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", ReportSchema);
