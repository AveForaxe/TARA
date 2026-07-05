require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./prisma/client");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server TARA berjalan dengan baik!");
});

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const financeRoutes = require("./routes/financeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const statsRoutes = require("./routes/statsRoutes");
const productRoutes = require("./routes/productRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/products", productRoutes);
app.get("/api/logs", require("./controllers/statsController").getAuditLogs);

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "online", db: "connected", dbType: "postgresql" });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`✅ Terhubung ke PostgreSQL via Prisma`);
});
