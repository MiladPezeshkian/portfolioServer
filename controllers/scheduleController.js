const SemesterSchedule = require("../models/SemesterSchedule");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * دریافت تمامی زمان‌بندی‌ها از دیتابیس
 */
exports.getAllSchedules = catchAsync(async (req, res, next) => {
  // می‌توانید در صورت نیاز با معیارهای مختلف (مثلاً بر اساس ترم) سند مربوطه را پیدا کنید.
  const schedules = await SemesterSchedule.find();

  res.status(200).json({
    status: "success",
    results: schedules.length,
    data: { schedules },
  });
});

/**
 * به‌روزرسانی (تنها تغییرات وارده) زمان‌بندی در دیتابیس
 * انتظار می‌رود داده‌های ارسالی شامل یک آرایه به نام changes باشد
 * هر تغییر شامل: day, timeSlot, course, location می‌باشد.
 */
exports.setAllSchedules = catchAsync(async (req, res, next) => {
  const changes = req.body.changes;
  if (!changes || !Array.isArray(changes)) {
    return next(new AppError("Invalid changes data provided", 400));
  }

  // برای مثال، سند زمان‌بندی مورد نظر را (مثلاً ترم جاری) دریافت می‌کنیم.
  // در اینجا به صورت ساده سند اول موجود را انتخاب می‌کنیم؛ در عمل می‌توانید بر اساس ترم یا معیار دیگر جستجو کنید.
  const scheduleDoc = await SemesterSchedule.findOne();
  if (!scheduleDoc) {
    return next(new AppError("No schedule found to update", 404));
  }

  // به‌روزرسانی تنها بخش‌های تغییر یافته در timetable
  changes.forEach((change) => {
    // تغییر: { day, timeSlot, course, location }
    // پیدا کردن بازه زمانی مناسب در آرایه timetable
    const slot = scheduleDoc.timetable.find(
      (slot) => slot.time === change.timeSlot
    );
    if (slot) {
      // به‌روزرسانی فیلد مربوط به روز مورد نظر در شی days
      slot.days[change.day] = {
        course: change.course,
        location: change.location,
      };
    }
  });

  // ذخیره سند به‌روز شده در دیتابیس
  await scheduleDoc.save();

  res.status(200).json({
    status: "success",
    data: { schedule: scheduleDoc },
  });
});
