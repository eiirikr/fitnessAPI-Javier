const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workout.js");
const { verify, isLoggedIn } = require("../auth");

router.post("/addWorkout", verify, isLoggedIn, workoutController.addWorkout);
router.get(
  "/getMyWorkouts",
  verify,
  isLoggedIn,
  workoutController.getMyWorkouts
);
router.put(
  "/updateWorkout/:workoutId",
  verify,
  isLoggedIn,
  workoutController.updateWorkout
);
router.delete(
  "/deleteWorkout/:workoutId",
  verify,
  isLoggedIn,
  workoutController.deleteWorkout
);
router.patch(
  "/completeWorkoutStatus/:workoutId",
  verify,
  isLoggedIn,
  workoutController.completeWorkoutStatus
);

module.exports = router;
