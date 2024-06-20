const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const { log } = require("node:console");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend's origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend's origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ data: "Hello world!" });
});

function generateRandomString(length) {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

var randomString = generateRandomString(16);

app.get("/:slug/", function (req, res) {
  io.use((socket, next) => {
    if (socket?.handshake?.auth?.length > 0) {
      console.log("nai");
    } else {
      console.log(generateRandomString(16));
      socket.sessionID = generateRandomString(16);
      socket.username = req.params.slug;
      next();
    }

    // console.log(socket);
  });
  res.json({ name: req.params.slug });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.emit("session", {
    sessionID: socket.sessionID,
    username: socket.username,
  });

  socket.on("check", (data) => {
    console.log(data);
  });

  socket.on("private message", ({ content, to }) => {
    console.log(`Message from ${socket.username} to ${to}: ${content}`);
    socket.to(to).emit("private message", {
      content,
      from: socket.username,
      to,
    });
  });

  // for (let [id, socket] of io.of("/").sockets) {
  //   console.log(id);
  // }
  // socket.on("message", (msg) => {
  //   console.log("message received:", msg);
  //   // Send a response back to the client
  //   socket.emit("message", `Server received: ${msg}`);
  // });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(5000, () => {
  console.log("server running at http://localhost:5000");
});
