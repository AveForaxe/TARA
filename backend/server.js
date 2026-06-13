require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

// Middleware
app.use(cors()); // Mengizinkan request dari frontend
app.use(express.json()); // Memungkinkan kita menerima data JSON dari request

// Cek koneksi ke MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

const Report = require("./models/Report");
const User = require("./models/User");

mongoose
  .connect(MONGODB_URI, { family: 4 })
  .then(() => {
    console.log("✅ Berhasil terkoneksi ke MongoDB!");
  })
  .catch((err) => console.error("❌ Gagal terkoneksi ke MongoDB:", err));

// Route dasar untuk percobaan
app.get("/", (req, res) => {
  res.send("Server TARA berjalan dengan baik!");
});

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const financeRoutes = require("./routes/financeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Routes Registration
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);

// Route untuk kesehatan sistem (Health Check)
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    res.json({ status: "online", db: "connected", dbName: mongoose.connection.name });
  } else {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Menjalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
