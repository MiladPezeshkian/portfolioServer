const mongoose = require("mongoose");
const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "University News",
          "Course Schedule",
          "Exam Timetable",
          "Research Announcement",
          "Job Opportunity",
          "Workshop",
          "Study Materials",
          "Syllabus Changes",
        ],
        message: "Invalid category",
      },
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    // The author is always Dr.Fathi. Using `immutable` ensures it cannot be changed after creation.
    author: {
      type: String,
      default: "Dr.Fathi",
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a text index on the title and content for improved search capabilities.
announcementSchema.index({ title: "text", content: "text" });

// Middleware to automatically archive announcements older than 1 year.
announcementSchema.pre("save", function (next) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (this.publishedAt < oneYearAgo && !this.isArchived) {
    this.isArchived = true;
  }
  next();
});

module.exports = mongoose.model("Announcement", announcementSchema);
