const { Mongoose } = require("mongoose");
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

//Admin
router.get("/admin-account",
ensureAuthenticated,
ensureRole("Admin"),
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
      res.render("pages/admin/account", {user});
    }
   })
  
}
);

router.get("/users-list", function (req, res, next) { 
  User.find((err, docs) => {
    if (!err) {
      res.render("pages/admin/users",{
        data: docs
      })
    } else {
      console.log("falid"+err);
    }
  });
 });


//User
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
  console.log(req.body.address);
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },req.body,{ new: true }
  );
  res.render("pages/users/account",{user})
}
);
router.get("/user/delete/:id", (req,res) =>{
  User.findByIdAndRemove(req.params.id, (err, doc) =>{
    if (!err) {
      res.redirect("../../login")
    }
  })
});


//Doctor
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
    console.log(req.body.address);
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },req.body,{ new: true }
    );
    res.render("pages/users/account",{user})
  }
);
router.get("/doctor/delete/:id", (req,res) =>{
  User.findByIdAndRemove(req.params.id, (err, doc) =>{
    if (!err) {
      res.redirect("../../login")
    }
  })
});
router.get("/login", (req, res) => {
  if (req.user) {
    if (req.user.Role == "Doctor") {
      res.redirect("/doctor-account");
    }
    if (req.user.Role == "Admin") {
      res.redirect("/admin-account");
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
    } 
    if (req.user.Role == "Admin") {
      res.redirect("/admin-account");
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