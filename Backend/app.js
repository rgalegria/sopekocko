"use strict";

// Middleware Imports

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); // Deprecation issue ('https://mongoosejs.com/docs/deprecations.html')

// Validators
const validator = require("validator");

// App security
const helmet = require("helmet");
const toobusy = require("toobusy-js");
const bouncer = require("express-bouncer")(10000, 600000, 5);
const mongoSanitize = require("express-mongo-sanitize");

// App Session
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

// App Routes
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// MondoDB Connection

mongoose
  .connect(
    "mongodb+srv://users-sopeckoko:gAFbt8ddOEwJT8W3@cluster0-zcn6k.azure.mongodb.net/SoPekocko?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connection to MongoDB succeeded !"))
  .catch(() => console.log("Connection to MongoDB failed !"));

const sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: "sessions",
});

// Initialize express App

const app = express();

// CORS Control Headers

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Helmet Middleware

app.use(helmet());

// Bouncer Middleware

bouncer.blocked = function (req, res, next, remaining) {
  res.send(
    429,
    "Too many requests have been made, " +
      "please wait " +
      remaining / 1000 +
      " seconds"
  );
};

// Too Busy Middleware

app.use(function (req, res, next) {
  if (toobusy()) {
    // log if you see necessary
    res.status(503).send("Server Too Busy");
  } else {
    next();
  }
});

// Express Session Middleware

app.use(
  session({
    secret: "RANDOM_TOKEN_SECRET",
    key: "Access",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      name: "Some Cookie",
      secure: false,
      httpOnly: true,
      sameSite: true,
      path: "/",
      maxAge: 3600 * 24, //3600 = 1 heure X 24 pour une journée
    },
  })
);

// Body Parsers Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sanitize Middleware

app.use(mongoSanitize());

// Access Routes

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

// App Execution

module.exports = app;
