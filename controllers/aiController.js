const AiModel = require("../models/AiModel");
const Category = require("../models/CategoryModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// ایجاد هوش مصنوعی جدید
// کنترلر برای ایجاد هوش مصنوعی جدید
exports.createAi = catchAsync(async (req, res, next) => {
  const { name, description, category, website, imageLink } = req.body;
  let image = imageLink;

  // بررسی اینکه آیا فایلی آپلود شده است
  if (!image && req.file) {
    image = "https://aiwebpage-server.onrender.com/";
    image += req.file.path.replace(/\\/g, "/");
    // حل مشکل در مسیر فایل برای ویندوز
  }

  // بررسی وجود دسته‌بندی
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError("دسته‌بندی یافت نشد", 404));
  }

  // ایجاد رکورد جدید هوش مصنوعی
  const newAi = await AiModel.create({
    name,
    description,
    category,
    website,
    image,
    whoAdded: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { ai: newAi },
  });
});

// دریافت همه هوش‌های مصنوعی
exports.getAllAis = catchAsync(async (req, res, next) => {
  const ais = await AiModel.find().populate("category", "name");
  res.status(200).json({
    status: "success",
    results: ais.length,
    data: { ais },
  });
});

// دریافت هوش مصنوعی بر اساس ID
exports.getAi = catchAsync(async (req, res, next) => {
  const ai = await AiModel.findById(req.params.id).populate("category", "name");

  if (!ai) {
    return next(new AppError("AI not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { ai },
  });
});

// به‌روزرسانی هوش مصنوعی
exports.updateAi = catchAsync(async (req, res, next) => {
  const updatedAi = await AiModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name");

  if (!updatedAi) {
    return next(new AppError("AI not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { ai: updatedAi },
  });
});

// حذف هوش مصنوعی
exports.deleteAi = catchAsync(async (req, res, next) => {
  const ai = await AiModel.findByIdAndDelete(req.params.id);

  if (!ai) {
    return next(new AppError("AI not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
// دریافت هوش‌های مصنوعی براساس دسته‌بندی
exports.getAiByCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params; // شناسه یا نام دسته‌بندی را از پارامترها دریافت می‌کنیم

  // پیدا کردن دسته‌بندی براساس شناسه یا نام
  const categoryObj = await Category.findOne({
    $or: [{ id: id }],
  });
  // console.log(categoryObj);

  if (!categoryObj) {
    return next(new AppError("Category not found", 404));
  }

  // دریافت تمام هوش‌های مصنوعی براساس دسته‌بندی پیدا شده
  const ais = await AiModel.find({ category: categoryObj._id });

  res.status(200).json({
    status: "success",
    results: ais.length,
    data: { ais },
  });
});
