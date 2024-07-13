const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const connectDB = require("../utils/db");

// Passport Strategy
passport.use(
  "local-signin",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      await connectDB();
      try {
        const user = await User.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Return user object with email and username
        return done(null, {
          id: user.id,
          email: user.email,
          username: user.username,
        });
      } catch (error) {
        console.error("Error during authentication:", error);
        return done(null, false, {
          message: "Something went wrong, please try again later",
        });
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email, username: user.username });
});

// Deserialize user from session
passport.deserializeUser(async (user, done) => {
  try {
    const auth_data = await User.findOne({ email: user.email });
    done(null, {
      id: auth_data.id,
      email: auth_data.email,
      username: auth_data.username,
    });
  } catch (error) {
    done(error, null);
  }
});

// Route for signin
router.post("/", function (req, res, next) {
  passport.authenticate("local-signin", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send(info.message);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(req.session);
      res.json({ isAuth: true, user: user });
    });
  })(req, res, next);
});

module.exports = router;
