const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const connectDB = require("./utils/db");
const User = require("./models/users");
const signupRouter = require("./auth/signup");
const logoutRouter = require("./auth/logout");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "https://simple-chat-app-3io6.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// const allowedOrigins = [`${process.env.API_URL}`, "http://localhost:3000"];

// const io = new Server(server, {
//   cors: {
//     origin: (origin, callback) => {
//       if (allowedOrigins.includes(origin) || !origin) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   },
// });

// Database connection
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");

    const sessionMiddleware = session({
      secret: "keyboard cat",
      saveUninitialized: false,
      resave: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        touchAfter: 24 * 3600,
      }),
      cookie: {
        maxAge: 30 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    });

    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(
      cors({
        origin: process.env.WEB_URL,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
      })
    );

    app.use(express.json());
    app.use(express.static("public"));

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
                  email: email,
                  username: req.body.username,
                  status: save_data,
                });
              }
            } else {
              console.log("here is the problem email & password");
              return done(null, false, {
                message: "Invalid email or password",
              });
            }
          } catch (error) {
            console.log(error);
            return done(null, false, { message: "Invalid email or password" });
          }
        }
      )
    );

    io.on("connection", async (socket) => {
      socket.on("private_message", (message) => {
        console.log(message);
      });

      socket.on("update_socket_id", async (username) => {
        if (username) {
          try {
            await User.findOneAndUpdate({ username }, { socket_id: socket.id });
            console.log(`Updated socket ID for user ${username}: ${socket.id}`);
          } catch (error) {
            console.error("Error updating socket ID:", error);
          }
        }
      });

      socket.on("isTyping", async (data) => {
        const toUser = await User.findOne({
          username: data.toUsername,
        }).select("-password");

        console.log(data.isTyping);
        socket.to(toUser.socket_id).emit("isTyping", {
          isTyping: data.isTyping,
          toUsername: data.toUsername,
          toUserFullname: data.toUserFullname,
          fromUsername: data.fromUsername,
          fromUserFullname: data.fromUserFullname,
        });
      });
    });

    // Use routers
    app.use("/auth/login", require("./auth/login"));
    app.use("/auth/logout", require("./auth/logout"));
    app.use("/test", require("./take"));
    app.use("/auth/signup", (req, res, next) => {
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
    }); // Ensure this is correctly registered
    app.use("/setup", require("./setup"));
    app.use("/", require("./indexRoute")(io));
    app.use("/chat", require("./chatRoute")(io));

    app.get("/isAuth", async function (req, res, next) {
      res.json({ user: req.session });
    });
    // 404 Handler
    app.use((req, res, next) => {
      res.status(404).send("Sorry, cannot find that!");
    });

    // Start server
    const port = process.env.PORT || 4000;
    server.listen(port, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
  });

module.exports = app;
