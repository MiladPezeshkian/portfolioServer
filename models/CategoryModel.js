const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // حذف فاصله‌های اضافی از ابتدا و انتهای رشته
  },
  id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  logo: {
    type: String,
    required: true, // اگر نیاز است که لوگو حتماً وارد شود
  },
});

module.exports = mongoose.model("Category", categorySchema);
