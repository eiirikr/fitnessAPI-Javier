const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const auth = require("../auth.js");

const { errorHandler } = auth;

// [SECTION] User Registration
module.exports.registerUser = (req, res) => {
  if (!req.body.email.includes("@")) {
    return res.status(400).send({
      error: "Email invalid",
    });
  } else if (req.body.password.length < 8) {
    return res.status(400).send({
      error: "Password must be atleast 8 characters",
    });
  } else {
    let newUser = new User({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    });

    return newUser
      .save()
      .then((result) =>
        res.status(201).send({
          message: "Registered Successfully",
        })
      )
      .catch((error) => errorHandler(error, req, res));
  }
};

// [SECTION] User Login/Authentication
module.exports.loginUser = (req, res) => {
  if (req.body.email.includes("@")) {
    return User.findOne({ email: req.body.email })
      .then((result) => {
        if (result == null) {
          return res.status(404).send({
            error: "No email found",
          });
        } else {
          const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            result.password
          );
          if (isPasswordCorrect) {
            return res.status(200).send({
              // message: 'User logged in successfully',
              access: auth.createAccessToken(result),
            });
          } else {
            return res.status(401).send({
              error: "Email and password do not match",
            });
          }
        }
      })
      .catch((error) => errorHandler(error, req, res));
  } else {
    return res.status(400).send({
      error: "Invalid Email",
    });
  }
};
