const express = require("express");
const passport = require("passport");
const User = require("../../models/User");

const router = express.Router();

router.get("/Clients", (req, res) => {
  User.find({ Role: "Client" })
    .then((User) => {
      res.send(User);
    })
    .catch((error) => {
      res.send({
        status: "failure",
        Message: "something went wrong =>",
        error,
      });
    });
});
router.get("/doctors", (req, res) => {
  User.find({ Role: "Doctor" })
    .then((doctors) => {
      res.send(doctors);
    })
    .catch((error) => {
      res.send({
        status: "failure",
        Message: "something went wrong =>",
        error,
      });
    });
});

module.exports = router;
