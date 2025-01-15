const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["completed", "in-progress", "not-started"],
    default: "not-started",
  },
});

module.exports = mongoose.model("Workout", workoutSchema);
