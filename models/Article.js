const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "عنوان مقاله الزامی است"],
    trim: true,
  },
  authors: {
    type: [String],
    required: [true, "نویسندگان الزامی هستند"],
    validate: {
      validator: (v) => v.length > 0,
      message: "حداقل یک نویسنده باید وارد شود",
    },
  },
  journal: {
    type: String,
    required: [true, "نام ژورنال الزامی است"],
  },
  year: {
    type: Number,
    required: true,
    min: [1900, "سال باید بین 1900 تا حال حاضر باشد"],
    max: [new Date().getFullYear(), "سال باید بین 1900 تا حال حاضر باشد"],
  },
  doi: {
    type: String,
    required: true,
    match: [/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, "فرمت DOI معتبر نیست"],
  },
  pdfPath: {
    type: String,
    required: [true, "فایل PDF الزامی است"],
  },
  award: String,
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Article", articleSchema);
