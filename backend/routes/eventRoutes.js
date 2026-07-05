const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const registrationController = require("../controllers/registrationController");
const authGuard = require("../middlewares/authGuard");
const roleCheck = require("../middlewares/roleCheck");

router.get("/", eventController.getAllEvents);

// Event Registration (public — no auth required)
router.post("/:id/register", registrationController.registerForEvent);

// Admin: view registrations
router.get("/:id/registrations", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA", "ADMINISTRATOR"]), registrationController.getEventRegistrations);

// Mutation: Only Developer and Karang Taruna
router.post("/", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA"]), eventController.createEvent);
router.put("/:id", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA"]), eventController.updateEvent);
router.delete("/:id", authGuard, roleCheck(["DEVELOPER", "KARANG TARUNA"]), eventController.deleteEvent);

module.exports = router;
