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

// App Routes
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// MondoDB Connection

require("dotenv").config();

mongoose
    .connect(process.env.MDB_DSN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connection to MongoDB succeeded !"))
    .catch(() => console.log("Connection to MongoDB failed !, Veillez vérifier votre string de conexion."));

// Initialize express App

const app = express();

// CORS Control Headers

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

// Helmet Middleware

app.use(helmet());

// Bouncer Middleware

bouncer.blocked = function (req, res, next, remaining) {
    res.send(429, "Too many requests have been made, " + "please wait " + remaining / 1000 + " seconds");
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

// Body Parser Middleware

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
