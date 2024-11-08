const fs = require("fs");
const path = require("path");
const Category = require("../models/CategoryModel");
exports.Upload = function () {
  // خواندن فایل جیسون
  fs.readFile(
    path.join(__dirname, "./AiCategories.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        return;
      }

      // تبدیل داده‌ها به یک آرایه از اشیا
      const products = JSON.parse(data);
      // برای هر عنصر در آرایه، آن را به دیتابیس اضافه کن
      products.forEach(async (product) => {
        const newProduct = new Category(product);
        try {
          await newProduct.save();
          // console.log("Product saved successfully");
        } catch (error) {}
      });
    }
  );
};
