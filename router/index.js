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
  const { name, email, phone, address, specialite, password } = body;
  console.log(specialite);
  const newUser = new User({
    name,
    email,
    phone,
    specialite,
    address,
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
  
    const id = req.user.id
    User.findById(id, function (err, user) { 
      if (err) {
        res.redirect('/')
      }
      if (!user) {
        res.redirect('/rest')
      }
      else{
        res.render("pages/users/account", {user});
      }
     })
    
  }
);
router.post("/user-account",
ensureAuthenticated,
ensureRole("Client"),
async (req, res) => {

  const id = req.user.id
  var query = {_id: req.user.id};
  
  User.findOneAndUpdate(query, req.body, {upsert: true}, function(err, doc) {
      if (err) return res.send(500, {error: err});
      return res.send('Succesfully saved.'+doc);
  });
  
}
);
router.get("/doctor-account",
  ensureAuthenticated,
  ensureRole("Doctor"),
  (req, res) => {
  
    const id = req.user.id
    User.findById(id, function (err, user) { 
      if (err) {
        res.redirect('/')
      }
      if (!user) {
        res.redirect('/rest')
      }
      else{
        res.render("pages/doctor/account", {user});
      }
     })
    
  }
);
router.post("/doctor-account",
  ensureAuthenticated,
  ensureRole("Doctor"),
  async (req, res) => {
    const id = req.user.id
    var query = {_id: req.user.id};
    
    User.findOneAndUpdate(query, req.body, {upsert: true}, function(err, doc) {
        if (err) return res.send(500, {error: err});
        return res.send('Succesfully saved.'+doc);
    });
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
