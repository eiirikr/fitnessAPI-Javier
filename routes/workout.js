const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workout");
const { authenticate } = require("../middleware/auth");

router.post("/addWorkout", authenticate, workoutController.addWorkout);
router.get("/getMyWorkouts", authenticate, workoutController.getMyWorkouts);
router.put("/updateWorkout/:id", authenticate, workoutController.updateWorkout);
router.delete(
  "/deleteWorkout/:id",
  authenticate,
  workoutController.deleteWorkout
);
router.put(
  "/completeWorkoutStatus/:id",
  authenticate,
  workoutController.completeWorkoutStatus
);

module.exports = router;
