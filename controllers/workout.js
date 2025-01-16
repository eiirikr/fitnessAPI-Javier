const Workout = require("../models/Workout.js");
const User = require("../models/User.js");

const { errorHandler } = require("../auth.js");

// [SECTION] Create Workouts
module.exports.addWorkout = async (req, res) => {
  try {
    const name = req.body.name;
    const workoutExists = await Workout.findOne({ name });

    if (workoutExists) {
      return res.status(409).send({
        message: "Workout already exists",
      });
    }

    let newWorkout = new Workout({
      name: req.body.name,
      duration: req.body.duration,
      status: req.body.status,
    });

    await newWorkout.save();

    return res.status(201).send(newWorkout);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Retrieve all workouts
module.exports.getMyWorkouts = async (req, res) => {
  try {
    const allWorkouts = await Workout.find({});

    if (allWorkouts.length > 0) {
      return res.status(200).send({ workouts: allWorkouts });
    } else {
      return res.status(404).send({
        message: "No workouts",
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Update Workout
module.exports.updateWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { name, duration, status } = req.body;

    // Validate inputs
    if (name && (typeof name !== "string" || name.trim() === "")) {
      return res.status(400).json({
        error: "Workout name must be a valid, non-empty string.",
      });
    }
    if (duration && (typeof duration !== "number" || duration <= 0)) {
      return res.status(400).json({
        error: "Duration must be a positive number.",
      });
    }
    if (status) {
      const validStatuses = ["pending", "in-progress", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Allowed values are: ${validStatuses.join(
            ", "
          )}.`,
        });
      }
    }

    // Find workout by ID and ensure it belongs to the authenticated user
    const workoutToUpdate = await Workout.findOne({
      _id: workoutId,
      userId: req.userId,
    });

    if (!workoutToUpdate) {
      return res.status(404).json({
        error: "Workout not found or unauthorized access.",
      });
    }

    // Update workout fields
    if (name) workoutToUpdate.name = name;
    if (duration) workoutToUpdate.duration = duration;
    if (status) workoutToUpdate.status = status;

    // Save updated workout
    const updatedWorkout = await workoutToUpdate.save();

    return res.status(200).json({
      message: "Workout updated successfully.",
      updatedWorkout: updatedWorkout,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Delete Workout
module.exports.deleteWorkout = async (req, res) => {
  const { workoutId } = req.params; // Get the workout ID from the URL parameter

  try {
    // Find the workout and ensure it belongs to the authenticated user
    const workout = await Workout.findOne({
      _id: workoutId,
      userId: req.userId,
    });

    if (!workout) {
      return res
        .status(404)
        .json({ error: "Workout not found or unauthorized access." });
    }

    // Delete the workout
    await Workout.deleteOne({ _id: workoutId });

    res.status(200).json({ message: "Workout deleted successfully." });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Mark a workout as complete
module.exports.completeWorkoutStatus = async (req, res) => {
  const workoutId = req.params.workoutId; // Get the workout ID from the URL parameter

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
    errorHandler(error, req, res);
  }
};
