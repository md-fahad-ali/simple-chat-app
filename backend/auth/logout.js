const express = require("express");
const router = express.Router();

// Route for signin
router.get("/", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ isAuth: false, session: req.session });
  });
});

module.exports = router;
