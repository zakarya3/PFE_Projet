const passport = require("passport");
const { ensureAuthenticated, ensureRole } = require("../config/auth");
const User = require("../models/User");
const router = require("express").Router();
router.get("/", (req, res) => {
  res.render("pages/index");
});
router.get("/register", (req, res) => {
  res.render("pages/register");
});
router.post("/register", (req, res) => {
  const { body } = req;
  const { name, email, phone, specialite, password } = body;
  console.log(specialite);
  const newUser = new User({
    name,
    email,
    phone,
    specialite,
    password,
    Role: specialite == undefined ? "Client" : "Doctor",
  });
  newUser
    .save()
    .then((result) => {
      if (result != null) {
        req.flash(
          "success_msg",
          email + " bien enregistré. Connectez-vous!"
        );
        res.redirect("/login");
      } else {
        res.redirect("/register");
      }
    })
    .catch((err) => {
      res.redirect("/register");
    });
});
router.get("/user-account",
  ensureAuthenticated,
  ensureRole("Client"),
  (req, res) => {
    res.render("pages/users/account");
  }
);
router.get("/doctor-account",
  ensureAuthenticated,
  ensureRole("Doctor"),
  (req, res) => {
    res.render("pages/doctor/account");
  }
);
router.get("/login", (req, res) => {
  if (req.user) {
    if (req.user.Role == "Doctor") {
      res.redirect("/doctor-account");
    } else {
      res.redirect("/user-account");
    }
  } else {
    res.render("pages/login");
  }
});


router.post("/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res, next) {
    if (req.user.Role == "Doctor") {
      res.redirect("/doctor-account");
    } else {
      res.redirect("/user-account");
    }
  }
);
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You Are successfully logged out");
  res.redirect("/login");
});

module.exports = router;
