// controllers/categoryController.js

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Category = require("../models/CategoryModel");

// ایجاد یک دسته‌بندی جدید
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, id, logo } = req.body;

  const newCategory = await Category.create({ name, id, logo });
  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

// دریافت همه دسته‌بندی‌ها
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

// دریافت یک دسته‌بندی بر اساس ID
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});

// به‌روزرسانی دسته‌بندی
exports.updateCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      category: updatedCategory,
    },
  });
});

// حذف دسته‌بندی
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
