// controllers/authController.js
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/Professor.js"); // مدل استاد
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/AppError.js");

// Helper function: ایجاد توکن JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper function: ارسال توکن به کاربر از طریق کوکی و پاسخ JSON
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // فقط در حالت تولید true خواهد بود
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  res.cookie("jwt", token, cookieOptions);

  // پاکسازی فیلد پسورد از خروجی
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// --------------------
// Login Controller
// --------------------
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) بررسی ارسال ایمیل و پسورد
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) پیدا کردن کاربر و بررسی صحت پسورد
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) ارسال توکن به کاربر
  createSendToken(user, 200, res);
});

// --------------------
// Protect Middleware: بررسی ورود کاربر
// --------------------
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // بررسی توکن در هدر authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // در غیر این صورت، بررسی کوکی‌ها
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // تأیید صحت توکن
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // پیدا کردن کاربر از روی decoded token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // بررسی تغییر رمز عبور پس از صدور توکن
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // افزودن کاربر به شیء request
  req.user = currentUser;
  next();
});

// --------------------
// Restrict To Middleware: محدود کردن دسترسی بر اساس نقش کاربری
// --------------------
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // بررسی نقش کاربر موجود در req.user
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You do not have permission to perform this action", 403)
//       );
//     }
//     next();
//   };
// };

// --------------------
// isLogin: بررسی وضعیت احراز هویت کاربر (برای استفاده در فرانت‌اند)
// --------------------
exports.isLogin = catchAsync(async (req, res, next) => {
  const token = req.cookies ? req.cookies.jwt : undefined;
  if (!token || token === "loggedout") {
    return res.status(200).json({ isAuthenticated: false });
  }
  return res.json({ isAuthenticated: true });
});

// --------------------
// Reset Password (بدون ورود کاربر)
// --------------------
// exports.resetPassword = catchAsync(async (req, res, next) => {
//   // پیدا کردن کاربر بر اساس ایمیل
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError("Code is invalid or has expired", 400));
//   }
//   // به‌روزرسانی رمز عبور
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();

//   // ورود مجدد کاربر و ارسال توکن
//   createSendToken(user, 200, res);
// });

// --------------------
// Reset Password in Logged In (تغییر رمز عبور در حین ورود)
// --------------------
exports.updateAccount = catchAsync(async (req, res, next) => {
  // Find the user by the email attached to req.user (e.g., from authentication middleware)
  const user = await User.findOne({ email: req.user.email }).select(
    "+password"
  );
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // Update email if a new email is provided and it's different from the current one.
  if (req.body.email && req.body.email !== user.email) {
    user.email = req.body.email;
  }

  // If a new password is provided, update the password.
  if (req.body.newPassword) {
    // Ensure the current password is provided
    if (!req.body.currentPassword) {
      return next(
        new AppError(
          "Current password is required to update the password.",
          400
        )
      );
    }

    // Verify that the current password is correct
    const isCurrentPasswordCorrect = await user.correctPassword(
      req.body.currentPassword,
      user.password
    );
    if (!isCurrentPasswordCorrect) {
      return next(new AppError("Your current password is wrong.", 400));
    }

    // Check that the new password is not the same as the current password
    const isSamePassword = await user.correctPassword(
      req.body.newPassword,
      user.password
    );
    if (isSamePassword) {
      return next(
        new AppError(
          "New password cannot be the same as the old password.",
          400
        )
      );
    }

    // Update the password field
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
  }

  // Save the user document to persist changes.
  await user.save();

  // If the password was updated, log out the user by resetting the JWT cookie.
  if (req.body.newPassword) {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 50 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return res.status(200).json({
      status: "success",
      message:
        "Account updated successfully. Your password has been reset, and you have been logged out.",
    });
  }

  // If only the email was updated, respond with success.
  res.status(200).json({
    status: "success",
    message: "Account updated successfully.",
  });
});

// --------------------
// Logout Controller: حذف توکن از کوکی
// --------------------
exports.logout = (req, res, next) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };
  res.cookie("jwt", "loggedout", cookieOptions);
  res.status(200).json({ status: "success" });
};

// --------------------
// Get Current User: دریافت اطلاعات کاربر جاری
// --------------------
exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user; // از protect middleware تنظیم شده است
  if (!user) {
    return next(new AppError("User not found.", 404));
  }
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// --------------------
// Update Current User Data (به‌جز تغییر رمز عبور)
// --------------------
exports.updateMe = catchAsync(async (req, res, next) => {
  // جلوگیری از تغییر رمز عبور در این روت
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // فیلتر کردن فیلدهای مجاز برای به‌روزرسانی
  const filteredBody = {};
  const allowedFields = ["name", "email", "PhoneNumber", "address"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== "") {
      filteredBody[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});
