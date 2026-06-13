const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

router.get("/", eventController.getAllEvents);

// Mutation: Only Developer and Karang Taruna
router.post("/", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA"]), eventController.createEvent);
router.put("/:id", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA"]), eventController.updateEvent);
router.delete("/:id", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA"]), eventController.deleteEvent);

module.exports = router;
