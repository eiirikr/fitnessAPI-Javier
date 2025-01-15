const Workout = require("../models/Workout");
const User = require("../models/User");

// Add a workout
exports.addWorkout = async (req, res) => {
  const { name, duration } = req.body;

  try {
    const workout = new Workout({ name, duration });
    await workout.save();

    const user = await User.findById(req.userId);
    user.workouts.push(workout._id);
    await user.save();

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all workouts for a user
exports.getMyWorkouts = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("workouts");
    res.status(200).json(user.workouts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a workout
exports.updateWorkout = async (req, res) => {
  const workoutId = req.params.id; // Get the workout ID from the URL
  const { name, duration, status } = req.body;

  try {
    // Find the workout by ID
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Ensure the workout belongs to the authenticated user
    const user = await User.findById(req.userId);
    if (!user.workouts.includes(workoutId)) {
      return res
        .status(403)
        .json({ message: "You can only update your own workouts" });
    }

    // Update the workout details
    workout.name = name || workout.name;
    workout.duration = duration || workout.duration;
    workout.status = status || workout.status;

    await workout.save();

    res.status(200).json({
      message: "Workout updated successfully",
      updatedWorkout: workout,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a workout
exports.deleteWorkout = async (req, res) => {
  const workoutId = req.params.id; // Get the workout ID from the URL parameter

  try {
    // Find the workout by its ID
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Ensure the workout belongs to the authenticated user
    const user = await User.findById(req.userId);
    if (!user.workouts.includes(workoutId)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own workouts" });
    }

    // Delete the workout
    await workout.remove();
    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a workout as complete
exports.completeWorkoutStatus = async (req, res) => {
  const workoutId = req.params.id; // Get the workout ID from the URL parameter

  try {
    // Find the workout by its ID
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Mark the workout as completed
    workout.status = "completed";
    await workout.save();

    res.status(200).json({
      message: "Workout status updated successfully",
      updatedWorkout: workout,
    }); // Return the updated workout
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};
