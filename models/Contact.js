const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email address.",
    ],
  },
  title: {
    type: String,
    required: [true, "Title is required."],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters."],
  },
  message: {
    type: String,
    required: [true, "Message is required."],
    minlength: [20, "Message must be at least 20 characters long."],
    maxlength: [1000, "Message cannot exceed 1000 characters."],
  },
  status: {
    type: String,
    enum: ["pending", "replied", "closed"],
    default: "pending",
  },
  replies: [
    {
      message: String,

      repliedAt: Date,
    },
  ],
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

contactUsSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("ContactUs", contactUsSchema);
