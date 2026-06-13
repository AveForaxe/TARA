const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

router.use(authGuard);

// Admin/Finance Routes
// GET: All except Karang Taruna
router.get("/", roleCheck(["DEVELOPER", "ADMINISTRATOR", "KEUANGAN", "KETUA RT"]), financeController.getAllFinances);

// POST/PUT/DELETE: Only Developer and Keuangan
router.post("/", roleCheck(["DEVELOPER", "KEUANGAN"]), financeController.createFinance);
router.put("/:id", roleCheck(["DEVELOPER", "KEUANGAN"]), financeController.updateFinanceStatus);
router.delete("/:id", roleCheck(["DEVELOPER", "KEUANGAN"]), financeController.deleteFinance);

module.exports = router;
