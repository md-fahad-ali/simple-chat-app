const express = require("express");
const router = express.Router();
const User = require("./models/users");
const connectDB = require("./utils/db");
const multiparty = require("multiparty");
const path = require("path");
const fs = require("fs");

router.get("/", async function (req, res) {
  await connectDB();
  try {
    console.log("Session data:", req.session);
    const username = req.session?.passport?.user?.username || null;
    console.log("Username from session:", username);
    if (username) {
      const find_data = await User.findOne(
        { username: username },
        { password: 0, _id: 0 }
      );
      console.log("User data from DB:", find_data);
      res.json({ user_data: find_data || null, user: req.session });
    } else {
      console.log("Username not found in session.");
      res.json({ user_data: null, user: req.session });
    }
  } catch (error) {
    console.log("Error fetching user data:", error);
    res.json({ status: null });
  }
});

function checkFile(file_name) {
  const allowedExtensions = ["png", "jpg", "webp", "gif", "jpeg"];
  return allowedExtensions.includes(file_name);
}

router.post("/", async function (req, res) {
  await connectDB();
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    const file = files.image ? files.image[0] : null;

    console.log("Uploaded file:", file);

    if (file) {
      const isValidFile = checkFile(
        path.extname(file.originalFilename).slice(1)
      );

      if (isValidFile) {
        console.log("Valid file format");
        const tempPath = file.path;
        const finalFileName = Date.now() + path.extname(file.originalFilename);
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

          try {
            const username = req.session?.passport?.user?.username || null;
            const data = await User.updateOne(
              { username: username },
              {
                first_name: fields?.first_name[0],
                last_name: fields?.last_name[0],
                image: `${process.env.OWN_URL}/uploads/${finalFileName}`,
                socket_id: fields?.socket_id[0],
              }
            );
            console.log("Update result:", data);
            res.json({
              status: "Update data successfully",
              data: data,
            });
          } catch (error) {
            console.log("Error updating user data:", error);
            res.status(500).json({
              status: "error",
              message: "Update failed",
              error: error,
            });
          }
        });
      } else {
        console.log("Invalid file format");
        try {
          const username = req.session?.passport?.user?.username || null;
          const data = await User.updateOne(
            { username: username },
            {
              first_name: fields?.first_name[0],
              last_name: fields?.last_name[0],
              socket_id: fields?.socket_id[0],
            }
          );
          console.log("Update result without image:", data);
          res.json({ status: "Update data successfully" });
        } catch (error) {
          console.log("Error updating user data without image:", error);
          res
            .status(500)
            .json({ status: "error", message: "Update failed", error: error });
        }
      }
    } else {
      res.status(400).send("No file uploaded");
    }
  });
});

module.exports = router;
