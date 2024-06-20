const express = require("express");
const router = express.Router();
const User = require("./models/users");
const connectDB = require("./utils/db");
const multiparty = require("multiparty");
const path = require("path");
const fs = require("fs");

module.exports = (io) => {
  router.get("/", async function (req, res) {
    await connectDB();

    const username = req.session?.passport?.user?.username || null;
    console.log(username);
    try {
      const find_data = await User.find({ username: { $ne: username } }).select(
        "-password"
      );

      const user = await User.find({ username: username }).select("-password");

      const session = req.session;
      res.json({
        user: user,
        user_data: find_data,
        session_data: req.session?.passport?.user || null,
      });
    } catch (error) {
      console.log(error);
      res.json({ status: null });
    }
  });

  return router;
};
