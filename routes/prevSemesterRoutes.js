const express = require("express");
const router = express.Router();
const prevSemesterController = require("../controllers/prevSemesterController");
const authController = require("../controllers/authController");

// مسیر دریافت تمامی ترم‌های گذشته
router.get("/", prevSemesterController.getPrevSemesters);

// مسیر دریافت یک ترم گذشته بر اساس آیدی
router.use(authController.protect);

// مسیر ایجاد یک ترم گذشته جدید
router.post("/", prevSemesterController.createPrevSemester);

// مسیر به‌روزرسانی یک ترم گذشته موجود
router.put("/:id", prevSemesterController.updatePrevSemester);

// مسیر حذف یک ترم گذشته
router.delete("/:id", prevSemesterController.deletePrevSemester);

module.exports = router;
