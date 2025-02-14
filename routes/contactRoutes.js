const express = require("express");
const router = express.Router();
const contactController = require("../controllers/Contact");
const authController = require("../controllers/authController");

// -------------------
// Public Routes
// -------------------
router.post("/", contactController.submitContactForm);

// -------------------
// Admin Routes
// -------------------
router.use(authController.protect);

// اصلاح مسیرها با پیشوند مناسب
router.get("/admin", contactController.getAllContacts);
router.post("/admin/reply", contactController.sendReply);
router.get("/admin/:id", contactController.getContactDetails);

module.exports = router;
