"use strict";

// Middleware Imports

const express = require("express");
const router = express.Router();
const bouncer = require("express-bouncer")(500, 900000);

// Routes

const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", bouncer.block, userCtrl.login);

// Execution

module.exports = router;
