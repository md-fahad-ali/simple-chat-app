const connectDb = require("./utils/db");
const User = require("./models/users");
const Chats = require("./models/chat");

(async () => {
  await connectDb();
  // const user = await User.findOne({ username: "fahad288" });
  // const chats = await Chats.find({
  //   $or: [{ fromUsername: user.username }, { toUsername: user.username }],
  // });

  const messages = await User.aggregate([
    {
      $lookup: {
        from: "messages",
        localField: "username",
        foreignField: "fromUsername",
        as: "messages",
      },
    },
    {
      $addFields: {
        latest_message: {
          $arrayElemAt: ["$messages", -1],
        },
      },
    },
    {
      $sort: {
        "latest_message.timestamp": -1,
      },
    },
    {
      $project: {
        password: 0,
        socket_id: 0,
        __v: 0,
        messages: 0,
      },
    },
  ]);

  console.log(messages);
})();
