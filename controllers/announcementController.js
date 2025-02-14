const Announcement = require("../models/Announcement.js");
const APIFeatures = require("../utils/apiFeatures.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/AppError.js"); // )nsure this module exists
// Create a new announcement
exports.createAnnouncement = catchAsync(async (req, res) => {
  const newAnnouncement = await Announcement.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      announcement: newAnnouncement,
    },
  });
});

// Get all announcements with pagination, filtering, sorting, and field limiting
exports.getAllAnnouncements = catchAsync(async (req, res) => {
  const features = new APIFeatures(Announcement.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const announcements = await features.query;

  res.status(200).json({
    status: "success",
    results: announcements.length,
    data: {
      announcements,
    },
  });
});

// Update an announcement
exports.updateAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!announcement) {
    return next(new AppError("Announcement not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      announcement,
    },
  });
});

// Delete an announcement
exports.deleteAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);

  if (!announcement) {
    return next(new AppError("Announcement not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Archive an announcement
exports.archiveAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { isArchived: true },
    { new: true }
  );

  if (!announcement) {
    return next(new AppError("Announcement not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      announcement,
    },
  });
});
