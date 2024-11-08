const mongoose = require("mongoose");

const AiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "AI name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },
  website: {
    type: String,
    required: [true, "Website URL is required"],
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: "Please enter a valid URL",
    },
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  whoAdded: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    trim: true,
  },
});

const AiModel = mongoose.model("Ai", AiSchema);
module.exports = AiModel;
