const ContactUs = require("../models/Contact");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
exports.submitContactForm = catchAsync(async (req, res, next) => {
  const { name, email, title, message } = req.body;

  // اعتبارسنجی پیشرفته
  if (!name?.trim() || !email?.trim() || !title?.trim() || !message?.trim()) {
    return next(
      new AppError(
        "Please fill in all required fields (name, email, title, message)",
        400
      )
    );
  }

  if (message.length < 30) {
    return next(
      new AppError("Message must be at least 30 characters long", 400)
    );
  }

  // ایجاد رکورد تماس
  const newContact = await ContactUs.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    title: title.trim(),
    message: message.trim(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // تهیه قالب ایمیل تایید دریافت پیام به صورت متنی
  const textTemplate = `Hello ${name.trim()},

Thank you for contacting the Dr.ParastoFathi Support Team. We have received your message successfully.

Message Details:
- Message ID: ${newContact._id}
- Sent At: ${new Date().toLocaleString("en-US")}

Your message will be reviewed by our support team, and you will receive a response within 48 business hours.

Best regards,
Dr.ParastoFathi Team`;

  await sendEmail({
    email: email.trim(),
    subject: "Message Received Confirmation - Dr.ParastoFathi",
    message: textTemplate,
  });

  // پاسخ API
  res.status(201).json({
    status: "success",
    code: 201,
    message: "Your message has been successfully submitted",
    data: {
      contactId: newContact._id,
      receivedAt: newContact.createdAt,
      nextSteps: [
        "Reviewed by the support team",
        "Response within 48 business hours",
      ],
    },
  });
});

// @desc    Get all contact messages (Admin)
// @route   GET /api/v1/contact/admin
// @access  Private/Admin
exports.getAllContacts = catchAsync(async (req, res, next) => {
  // تبدیل پارامترهای صفحه‌بندی به عدد
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // ساخت کوئری جستجو
  let query = ContactUs.find();

  if (req.query.search) {
    query = query.or([
      { email: { $regex: req.query.search, $options: "i" } },
      { name: { $regex: req.query.search, $options: "i" } },
      { title: { $regex: req.query.search, $options: "i" } },
      { message: { $regex: req.query.search, $options: "i" } },
    ]);
  }

  // اجرای کوئری با صفحه‌بندی
  const contacts = await query
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  // محاسبه تعداد کل اسناد مطابق با فیلتر
  const total = await ContactUs.countDocuments(query.getFilter());

  res.status(200).json({
    status: "success",
    data: {
      total,
      page,
      pages: Math.ceil(total / limit),
      contacts,
    },
  });
});

// @desc    Send reply to contact message
// @route   POST /api/v1/contact/admin/reply
// @access  Private/Admin
exports.sendReply = catchAsync(async (req, res, next) => {
  const { contactId, replyMessage } = req.body;

  if (!contactId || !replyMessage?.trim()) {
    return next(new AppError("Contact ID and reply message are required", 400));
  }

  const contact = await ContactUs.findById(contactId);
  if (!contact) {
    return next(new AppError("Message not found", 404));
  }

  // به‌روزرسانی وضعیت تماس و افزودن پاسخ
  contact.status = "replied";
  contact.replies.push({
    message: replyMessage,
    repliedAt: Date.now(),
  });
  await contact.save();

  // تهیه قالب ایمیل پاسخ به صورت متنی
  const replyText = `Hello ${contact.name},
This is reply to your message You Sent To Dr'ParastoFathi":
${replyMessage}
Best regards,
Dr'ParastoFathi`;

  await sendEmail({
    email: contact.email,
    subject: `Reply to Your Message - ${contact.title}`,
    message: replyText,
  });

  res.status(200).json({
    status: "success",
    message: "Reply sent successfully",
    data: {
      repliedAt: new Date(),
      admin: req.user
        ? { id: req.user._id, name: req.user.name }
        : { id: "N/A", name: "System Admin" },
    },
  });
});

// @desc    Get single contact details
// @route   GET /api/v1/contact/admin/:id
// @access  Private/Admin
exports.getContactDetails = catchAsync(async (req, res, next) => {
  const contact = await ContactUs.findById(req.params.id)
    .populate("replies.repliedBy", "name email")
    .lean();

  if (!contact) {
    return next(new AppError("Message not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      ...contact,
      message: contact.message,
      replies: contact.replies.map((reply) => ({
        ...reply,
        repliedBy: reply.repliedBy || { name: "System" },
      })),
    },
  });
});
