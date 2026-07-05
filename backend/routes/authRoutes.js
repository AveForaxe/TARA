const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/handshake", authController.handshakeQR);

module.exports = router;
