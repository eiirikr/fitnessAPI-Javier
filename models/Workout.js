const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Name is Required"],
  },
  duration: {
    type: String,
    required: [true, "Duration is Required"],
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["completed", "in-progress", "pending"],
    default: "pending",
  },
});

module.exports = mongoose.model("Workout", workoutSchema);
