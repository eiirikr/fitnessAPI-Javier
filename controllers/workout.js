const Workout = require("../models/Workout.js");
const { errorHandler } = require("../auth.js");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken"); // Ensure you import the jwt package

// [SECTION] Create Workouts
module.exports.addWorkout = async (req, res) => {
  try {
    const { name, duration, status } = req.body;

    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    // Decode the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Replace with your secret key
    const userId = decoded.id; // Assuming the token contains a userId

    // Check if a workout with the same name already exists
    const workoutExists = await Workout.findOne({ name });
    if (workoutExists) {
      return res.status(409).json({ message: "Workout already exists" });
    }

    // Create a new workout using the userId from the token
    const newWorkout = new Workout({
      userId, // Use userId from the decoded token
      name,
      duration,
      status,
    });

    // Save the workout to the database
    await newWorkout.save();

    // Return success response with the expected fields
    return res.status(201).json({
      userId: newWorkout.userId, // Return the userId from the created workout
      name: newWorkout.name,
      duration: newWorkout.duration,
      status: newWorkout.status,
      _id: newWorkout._id,
      dateAdded: newWorkout.dateAdded, // Automatically set by Mongoose timestamps
      __v: newWorkout.__v, // Mongoose document version key
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Retrieve all workouts
module.exports.getMyWorkouts = async (req, res) => {
  try {
    // Fetch all workouts and populate the userId field
    const allWorkouts = await Workout.find({}).populate("userId", "_id"); // Populating only the _id field of the user

    return res.status(200).json({
      workouts: allWorkouts.map((workout) => ({
        _id: workout._id,
        userId: workout.userId ? workout.userId._id : null, // Safe check for userId
        name: workout.name,
        duration: workout.duration,
        status: workout.status,
        dateAdded: workout.dateAdded,
        __v: workout.__v,
      })),
    });
  } catch (error) {
    console.error("Error retrieving workouts:", error);
    errorHandler(error, req, res);
  }
};

// [SECTION] Update Workout
module.exports.updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, status } = req.body;

    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    // Decode the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id; // Get the userId from the decoded token

    console.log("userId from token:", userId);
    console.log("Workout ID from request:", id);

    // Validate if the workout ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid workout ID." });
    }

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

    // Find and update the workout for the specific userId
    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: id, userId: userId }, // Use the userId from the token
      { name, duration, status },
      { new: true, runValidators: true }
    );

    if (!updatedWorkout) {
      return res.status(404).json({
        error: "Workout not found or unauthorized access.",
      });
    }

    return res.status(200).json({
      message: "Workout updated successfully.",
      updatedWorkout: updatedWorkout,
    });
  } catch (error) {
    console.error("Error updating workout:", error);
    errorHandler(error, req, res);
  }
};

// [SECTION] Delete Workout
module.exports.deleteWorkout = async (req, res) => {
  const { id } = req.params; // Get the workout ID from the URL parameter

  try {
    // Find the workout and ensure it belongs to the authenticated user
    const workout = await Workout.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!workout) {
      return res
        .status(404)
        .json({ message: "Workout not found or unauthorized access." });
    }

    // Delete the workout
    await Workout.deleteOne({ _id: id });

    return res.status(200).json({
      message: "Workout deleted successfully",
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// [SECTION] Mark a workout as complete
module.exports.completeWorkoutStatus = async (req, res) => {
  const id = req.params.id; // Get the workout ID from the URL parameter

  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    // Decode the token to get the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id; // Get the userId from the decoded token

    console.log("userId from token:", userId); // Log userId from token

    // Find the workout by its ID and ensure it belongs to the authenticated user
    const workout = await Workout.findOne({ _id: id });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    console.log("Workout userId:", workout.userId); // Log userId from workout document

    if (workout.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this workout" });
    }

    // Mark the workout as completed
    workout.status = "completed";
    await workout.save();

    return res.status(200).json({
      message: "Workout status updated successfully",
      updatedWorkout: {
        _id: workout._id,
        userId: workout.userId,
        name: workout.name,
        duration: workout.duration,
        status: workout.status,
        dateAdded: workout.dateAdded,
        __v: workout.__v,
      },
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
