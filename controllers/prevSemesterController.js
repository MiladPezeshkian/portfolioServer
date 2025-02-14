const PrevSemester = require("../models/prevSemester");

// دریافت تمامی ترم‌های گذشته
exports.getPrevSemesters = async (req, res) => {
  try {
    const semesters = await PrevSemester.find().sort({ year: -1 });
    return res.status(200).json({ data: semesters });
  } catch (error) {
    console.error("Error fetching previous semesters:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// دریافت یک ترم گذشته بر اساس آیدی

// ایجاد یک ترم گذشته جدید
exports.createPrevSemester = async (req, res) => {
  try {
    const { year, season, students, courses } = req.body;
    const newSemester = new PrevSemester({ year, season, students, courses });
    const savedSemester = await newSemester.save();
    return res.status(201).json({ data: savedSemester });
  } catch (error) {
    console.error("Error creating previous semester:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// به‌روزرسانی یک ترم گذشته موجود
exports.updatePrevSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, season, students, courses } = req.body;
    const updatedSemester = await PrevSemester.findByIdAndUpdate(
      id,
      { year, season, students, courses },
      { new: true, runValidators: true }
    );
    if (!updatedSemester) {
      return res.status(404).json({ error: "Previous semester not found" });
    }
    return res.status(200).json({ data: updatedSemester });
  } catch (error) {
    console.error("Error updating previous semester:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

// حذف یک ترم گذشته
exports.deletePrevSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSemester = await PrevSemester.findByIdAndDelete(id);
    if (!deletedSemester) {
      return res.status(404).json({ error: "Previous semester not found" });
    }
    return res.status(200).json({ data: deletedSemester });
  } catch (error) {
    console.error("Error deleting previous semester:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};
