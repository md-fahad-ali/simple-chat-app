const express = require("express");
const router = express.Router();
const User = require("./models/users");
const connectDB = require("./utils/db");
const multiparty = require("multiparty");
const path = require("path");
const fs = require("fs");
const Chat = require("./models/chat");
const { timeStamp } = require("console");
const { encryptMessage } = require("./utils/crypto");

module.exports = (io) => {
  router.get("/:username", async function (req, res) {
    await connectDB();

    console.log("request username", req.params.username);
    const param_user = req.params.username;

    const username = req.session?.passport?.user?.username || null;
    try {
      const find_user = await User.find({ username: param_user }).select(
        "-password"
      );

      if (find_user.length > 0) {
        const find_data = await User.find({
          username: { $ne: username },
        }).select("-password");
        const recipient_user = await User.find({ username: param_user }).select(
          "-password"
        );
        const user = await User.find({ username: username }).select(
          "-password"
        );

        console.log("username", req.session);
        console.log("auth user data", user);
        const chats = await Chat.find({
          $or: [
            {
              $and: [{ fromUsername: username }, { toUsername: param_user }],
            },
            {
              $and: [{ fromUsername: param_user }, { toUsername: username }],
            },
          ],
        });
        console.log(chats);
        res.json({
          user_data: find_data,
          recipient_user: recipient_user,
          user: user,
          chats: chats,
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: null });
    }
  });

  // var password = process.env.SECRET_KEY;

  function checkFile(file_name) {
    const allowedExtensions = ["png", "jpg", "webp", "gif", "jpeg"];
    return allowedExtensions.includes(file_name);
  }

  router.get("/:username", async function (req, res) {
    await connectDB();
    console.log("request username", req.params.username);
    const param_user = req.params.username;
    const username = req.session?.passport?.user?.username || null;
    try {
      const find_user = await User.findOne({ username: param_user }).select(
        "-password"
      );
      if (find_user) {
        const find_data = await User.find({
          username: { $ne: username },
        }).select("-password");
        const recipient_user = await User.findOne({
          username: param_user,
        }).select("-password");
        const user = await User.findOne({ username: username }).select(
          "-password"
        );
        console.log("username", req.session);
        console.log("auth user data", user);
        const chats = await Chat.find({
          $or: [
            {
              $and: [{ fromUsername: username }, { toUsername: param_user }],
            },
            {
              $and: [{ fromUsername: param_user }, { toUsername: username }],
            },
          ],
        });
        console.log(chats);
        res.json({
          user_data: find_data,
          recipient_user: recipient_user,
          user: user,
          chats: chats,
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: null });
    }
  });

  router.post("/:username", async function (req, res) {
    console.log("request username", req?.params.username);
    try {
      const toUser = await User.findOne({
        username: req.params?.username,
      }).select("-password");
      if (toUser && toUser.socket_id) {
        console.log(`Sending message to socket ID ${toUser.socket_id}`);
        const content = req.body.message;
        console.log(
          "username is chatroute",
          req.session?.passport?.user?.username
        );
        io.to(toUser.socket_id).emit("private_message", {
          content: content,
          fromUsername: req.session?.passport?.user?.username || null,
          fromUserFullname: req.body?.msg_for_fullname,
          toUsername: req.params?.username,
          toUserFullname: req.body?.msg_to_fullname,
          timeStamp: new Date().toISOString(),
        });
        const data = new Chat({
          content: content,
          fromUsername: req.session?.passport?.user?.username || null,
          fromUserFullname: req.body?.msg_for_fullname,
          toUserFullname: req.body?.msg_to_fullname,
          toUsername: req.params?.username || null,
        });
        const save_info = await data.save();
        console.log(save_info);
      } else {
        console.log(
          `User ${req.params.username} not found or socket ID missing`
        );
      }
    } catch (error) {
      console.error("Error sending private message:", error);
    }
    res.json({ success: req.params.username });
  });

  router.post("/:username/file", (req, res, next) => {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      const file = files.file ? files.file[0] : null;
      if (file) {
        const isValidFile = checkFile(
          path.extname(file.originalFilename).slice(1)
        );
        if (isValidFile) {
          console.log("Valid file format");
          const tempPath = file.path;
          const finalFileName =
            Date.now() + path.extname(file.originalFilename);
          const targetPath = path.join(
            __dirname,
            "public/uploads",
            finalFileName
          );
          fs.copyFile(tempPath, targetPath, async (err) => {
            if (err) {
              res.status(500).send({
                status: "error",
                message: "File saving failed",
                error: err,
              });
              return;
            }
            fs.unlink(tempPath, async (err) => {
              if (err) {
                res.status(500).send({
                  status: "error",
                  message: "File cleanup failed",
                  error: err,
                });
                return;
              }
            });
            console.log(process.env.OWN_URL);
          });
        } else {
          console.log("Invalid file format");
        }
      }
      res.json({ success: true });
    });
  });

  return router;
};
