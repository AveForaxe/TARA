const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

router.use(authGuard);

// GET: All administrative roles can see user list
router.get("/", roleCheck(["DEVELOPER", "ADMINISTRATOR", "KEUANGAN", "KARANG TARUNA", "KETUA RT"]), userController.getAllUsers);

// POST: Create users (Dev, Admin, RT)
router.post("/", roleCheck(["DEVELOPER", "ADMINISTRATOR", "KETUA RT"]), userController.createUser);

// PUT: Update users (Dev, Admin, RT)
router.put("/:id", roleCheck(["DEVELOPER", "ADMINISTRATOR", "KETUA RT"]), userController.updateUser);

// DELETE: Only Dev and Admin
router.delete("/:id", roleCheck(["DEVELOPER", "ADMINISTRATOR"]), userController.deleteUser);

// REGENERATE: Only Dev and Admin
router.post("/:id/regenerate", roleCheck(["DEVELOPER", "ADMINISTRATOR"]), userController.regenerateQR);

module.exports = router;
