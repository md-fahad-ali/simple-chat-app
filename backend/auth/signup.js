const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const connectDB = require("../utils/db");

// Passport Strategy
passport.use(
  "local-signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      console.log("Request from local-signup strategy:", req.body);
      await connectDB();
      try {
        const find_data = await User.findOne({ email: email });
        if (email && password) {
          if (find_data) {
            return done(null, false, { message: "Email already exists" });
          } else {
            const user = new User({
              email: email,
              password: password,
              username: req.body.username,
            });
            const save_data = await user.save();
            return done(null, {
              id: save_data.id,
              email: email,
              username: req.body.username,
            });
          }
        } else {
          return done(null, false, { message: "Invalid email or password" });
        }
      } catch (error) {
        return done(null, false, { message: "Invalid email or password" });
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email, username: user.username });
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route for signup
router.post("/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
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
      res.json({ isAuth: true, user: user });
    });
  })(req, res, next);
});

module.exports = router;
