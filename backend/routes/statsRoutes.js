const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

router.get("/", statsController.getStats);
router.get("/logs", statsController.getAuditLogs);

module.exports = router;
