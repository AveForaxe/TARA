const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

// Public/Warga Routes (Still Protected)
router.post("/", authGuard, reportController.createReport);
router.get("/my", authGuard, reportController.getMyReports);

// Admin Routes
router.get("/", authGuard, roleCheck(["DEVELOPER", "ADMINISTRATOR", "KETUA RT"]), reportController.getAllReports);
router.put("/:id", authGuard, roleCheck(["DEVELOPER", "ADMINISTRATOR", "KETUA RT"]), reportController.updateReportStatus);
router.delete("/:id", authGuard, roleCheck(["DEVELOPER", "ADMINISTRATOR"]), reportController.deleteReport);

module.exports = router;
