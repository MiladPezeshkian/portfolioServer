// routes/categoryRoutes.js

const express = require("express");
const categoryController = require("../controllers/categoryController");
const Auth = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router.use(
  Auth.protect, // فقط کاربران وارد شده می‌توانند کاربران را مشاهده کنند
  Auth.restrictTo("admin")
); // فقط ادمین‌ها می‌توانند کاربران را مشاهده کنند);
router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
