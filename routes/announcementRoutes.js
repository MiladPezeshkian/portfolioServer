const express = require("express");
const anno = require("../controllers/announcementController.js");
const authController = require("../controllers/authController.js");

const router = express.Router();

// Public endpoint: Get all announcements
router.get("/", anno.getAllAnnouncements);

// Apply authentication middleware for all routes below
router.use(authController.protect);

// Create a new announcement
router.post("/", anno.createAnnouncement);

// Update an existing announcement
router.patch("/:id", anno.updateAnnouncement);

// Delete an announcement
router.delete("/:id", anno.deleteAnnouncement);

// Archive an announcement
router.patch("/:id/archive", anno.archiveAnnouncement);

module.exports = router;
