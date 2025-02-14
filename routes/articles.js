const express = require("express");
const {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController.js");
const upload = require("../utils/fileUpload.js");
const authMiddleware = require("../controllers/authController.js");

const router = express.Router();

// Public routes
router.get("/", getArticles);

// Admin routes (Protected)

router.use(authMiddleware.protect);
router.post(
  "/",
  upload.single("pdfFile"), // Change "pdf" to "pdfFile"
  createArticle
);

router.put(
  "/:id",
  upload.single("pdfFile"), // Change "pdf" to "pdfFile"
  updateArticle
);

router.delete("/:id", deleteArticle);

module.exports = router;
