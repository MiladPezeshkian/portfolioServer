const express = require("express");
const aiController = require("../controllers/aiController");
const auth = require("../controllers/authController");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
router.get("/category/:id", aiController.getAiByCategory);
router.route("/").get(aiController.getAllAis);
router
  .route("/")
  .post(auth.protect, upload.single("image"), aiController.createAi);

router.use(auth.protect, auth.restrictTo("admin"));
router
  .route("/:id")
  .get(aiController.getAi)
  .patch(aiController.updateAi)
  .delete(aiController.deleteAi);

// مسیر برای دریافت هوش‌های مصنوعی براساس دسته‌بندی

module.exports = router;
