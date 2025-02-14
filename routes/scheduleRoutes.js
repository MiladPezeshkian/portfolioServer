const express = require("express");
const scheduleController = require("../controllers/scheduleController");
const authController = require("../controllers/authController");

const router = express.Router();

// دریافت زمان‌بندی برای همه کاربران بدون نیاز به احراز هویت
router.route("/getAll").get(scheduleController.getAllSchedules);

// احراز هویت برای اعمال تغییرات در زمان‌بندی
router.use(authController.protect);

router.route("/setAll").put(scheduleController.setAllSchedules);

module.exports = router;
