const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const professorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "نام استاد الزامی است."],
  },
  email: {
    type: String,
    required: [true, "ایمیل الزامی است."],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "رمز عبور الزامی است."],
    minlength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    // تنها زمانی که password تغییر کرده باشد، این فیلد الزامی خواهد بود:
    required: [
      function () {
        return this.isModified("password");
      },
      "تایید رمز عبور الزامی است.",
    ],
    validate: {
      // فقط در زمان ایجاد سند (یا تغییر password) اعتبارسنجی می‌شود
      validator: function (el) {
        return el === this.password;
      },
      message: "رمز عبور و تایید آن مطابقت ندارند!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// پیش‌ذخیره: هش کردن رمز عبور قبل از ذخیره
professorSchema.pre("save", async function (next) {
  // اگر رمز عبور تغییر نکرده باشد، به سادگی ادامه می‌دهیم
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // پس از هش کردن رمز عبور، نیازی به نگه‌داشتن passwordConfirm نداریم
  this.passwordConfirm = undefined;

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// متد مقایسه رمز عبور ورودی با رمز عبور ذخیره‌شده
professorSchema.methods.correctPassword = async function (
  candidatePassword,
  professorPassword
) {
  return await bcrypt.compare(candidatePassword, professorPassword);
};

// بررسی تغییر پسورد بعد از ایجاد توکن JWT
professorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangedTimestamp;
  }
  return false;
};

// تولید توکن بازنشانی پسورد
professorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Professor = mongoose.model("Professor", professorSchema);
module.exports = Professor;
