const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CourseSchema = new Schema(
  {
    course: {
      type: String,
      validate: {
        validator: function (v) {
          return v !== null && v !== undefined; // رشته‌های خالی مجاز هستند
        },
        message: "Course name is required",
      },
      trim: true,
    },
    location: {
      type: String,
      validate: {
        validator: function (v) {
          return v !== null && v !== undefined;
        },
        message: "Location is required",
      },
      trim: true,
    },
  },
  { _id: false }
);

const DaysSchema = new Schema(
  {
    Sat: { type: CourseSchema, default: null },
    Sun: { type: CourseSchema, default: null },
    Mon: { type: CourseSchema, default: null },
    Tue: { type: CourseSchema, default: null },
    Wed: { type: CourseSchema, default: null },
    Thu: { type: CourseSchema, default: null },
    Fri: { type: CourseSchema, default: null },
  },
  { _id: false }
);

const TimeSlotSchema = new Schema(
  {
    time: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
    },
    days: {
      type: DaysSchema,
      required: true,
    },
  },
  { _id: false }
);

const SemesterScheduleSchema = new Schema(
  {
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    teacher: {
      type: String,
      required: [true, "Teacher name is required"],
      trim: true,
      default: "parastofathi",
      immutable: true,
    },
    timetable: {
      type: [TimeSlotSchema],
      required: [true, "Timetable is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("SemesterSchedule", SemesterScheduleSchema);
