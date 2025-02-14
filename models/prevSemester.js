const mongoose = require("mongoose");

const PrevSemesterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    season: {
      type: String,
      required: [true, "Season is required"],
      enum: {
        values: ["Fall", "Spring", "Summer", "Winter"],
        message: "Season must be one of: Fall, Spring, Summer, Winter",
      },
    },
    students: {
      type: Number,
      required: [true, "Number of students is required"],
      default: 0,
    },
    courses: [
      {
        type: String,
        required: [true, "At least one course is required"],
      },
    ],
  },
  {
    timestamps: true, // افزودن فیلدهای createdAt و updatedAt به‌صورت خودکار
  }
);

module.exports = mongoose.model("prevSemester", PrevSemesterSchema);
