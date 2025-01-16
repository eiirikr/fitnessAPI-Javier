// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// [SECTION] Routes
const userRoutes = require("./routes/user.js");
const workoutRoutes = require("./routes/workout.js");

// [SECTION] Environment Setup
require("dotenv").config();

// [SECTION] Server Setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update CORS options to use BASE_URL from the environment
const corsOptions = {
  origin: [
    "http://localhost:8000",
    "http://localhost:4000",
    "http://localhost:3000",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// [SECTION] Database Connection
mongoose.connect(process.env.MONGODB_URI, {});
mongoose.connection.once("open", () =>
  console.log("Now Connected to MongoDB Atlas.")
);

// [SECTION] Backend Routes
app.use("/users", userRoutes);
app.use("/workouts", workoutRoutes);

// [SECTION] Server Gateway Response
if (require.main === module) {
  app.listen(process.env.PORT || 4000, () => {
    console.log(`API is now online on port ${process.env.PORT || 4000}`);
  });
}

module.exports = { app, mongoose };
