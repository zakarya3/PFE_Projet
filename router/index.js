const { Mongoose } = require("mongoose");
const passport = require("passport");
const { ensureAuthenticated, ensureRole } = require("../config/auth");
const User = require("../models/User");
const Specialitie = require('../models/Specialitie');
const Rdv = require('../models/Rdv');
const router = require("express").Router();
router.get("/", (req, res) => {
  res.render("pages/index");
});
router.get("/register", function (req, res, next) {
  Specialitie.find((err, docs) => {
    if (!err) {
      res.render("pages/register",{
        data: docs
      })
    } else {
      console.log("falid"+err);
    }
  });
});
router.post("/register", (req, res) => {
  const { body } = req;
  const { name, email, doctor_id, phone, address, specialite, password} = body;
  console.log(specialite);
  const newUser = new User({
    name,
    email,
    doctor_id,
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

router.get("/users-list",
ensureAuthenticated,
ensureRole("Admin"),
function (req, res, next) { 
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

 router.get("/add-doctors",
ensureAuthenticated,
ensureRole("Admin"),
(req, res) => {
  Specialitie.find((err, docs) => {
    if (!err) {
      res.render("pages/admin/add-doctors",{
        data: docs
      })
    } else {
      console.log("falid"+err);
    }
  }); 
}
);

 router.post("/add-doctors", (req, res) => {
  const { body } = req;
  const { name, email, doctor_id, phone, address, specialite, password} = body;
  console.log(specialite);
  const newUser = new User({
    name,
    email,
    doctor_id,
    phone,
    specialite,
    address,
    password,
    Role: "Doctor",
  });
  newUser
    .save()
    .then((result) => {
      if (result != null) {
        req.flash(
          "success_msg",
          email + " bien enregistré. Connectez-vous!"
        );
        res.redirect("/users-list");
      } else {
        res.redirect("/admin-account");
      }
    })
    .catch((err) => {
      res.redirect("/admin-account");
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

router.get("/reservation",
  ensureAuthenticated,
  ensureRole("Client"),
  (req, res) => {
    User.find((err, docs) => {
      if (!err) {
        res.render("pages/reservation",{
          data: docs,
          name: req.user.name,
          id: req.user.id
        })
      } else {
        console.log("falid"+err);
      }
    }); 
    
  }
);
router.post("/reservation", (req, res) => {
  const { body } = req;
  const { idpatient, date, medecin, message} = body;
  const newRdv = new Rdv({
    idpatient,
    date,
    medecin,
    message,
  });
  newRdv
    .save()
    .then((result) => {
      if (result != null) {
        req.flash(
          "success_msg",
          email + " bien enregistré. Connectez-vous!"
        );
        res.redirect("/users-list");
      } else {
        res.redirect("/admin-account");
      }
    })
    .catch((err) => {
      res.redirect("/admin-account");
    });
});

router.get("/rdv",
  ensureAuthenticated,
  ensureRole("Client"),
  (req, res) => {
    Rdv.find((err, docs) => {
      if (!err) {
        res.render("pages/users/rdv",{
          data: docs,
          user: req.user
        })
      } else {
        console.log("falid"+err);
      }
    }); 
    
  }
);
router.get("/annuler/:id", (req,res) =>{
  Rdv.findByIdAndRemove(req.params.id, (err, doc) =>{
    if (!err) {
      res.redirect("/rdv")
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
router.get("/accept/:id", (req, res) => {
  User.findOneAndUpdate( {_id: req.params.id}, {"$set":{"Accepte":true}}, (err, doc) =>{
    if (!err) {
      console.log("done");
      res.redirect("/users-list");
    } else {
      console.log(err);
    }
  })
});
router.get("/block/:id", (req, res) => {
  User.findOneAndUpdate( {_id: req.params.id}, {"$set":{"Accepte":false}}, (err, doc) =>{
    if (!err) {
      console.log("done");
      res.redirect("/users-list");
    } else {
      console.log(err);
    }
  })
});


router.get("/accepter/:id", (req, res) => {
  Rdv.findOneAndUpdate( {_id: req.params.id}, {"$set":{"status":true}}, (err, doc) =>{
    if (!err) {
      console.log("done");
      res.redirect("/request");
    } else {
      console.log(err);
    }
  })
});
router.get("/refuser/:id", (req, res) => {
  Rdv.findOneAndUpdate( {_id: req.params.id}, {"$set":{"status":false}}, (err, doc) =>{
    if (!err) {
      console.log("done");
      res.redirect("/request");
    } else {
      console.log(err);
    }
  })
});


router.get("/request",
  ensureAuthenticated,
  ensureRole("Doctor"),
  (req, res) => {
    Rdv.find((err, docs) => {
      if (!err) {
        res.render("pages/doctor/request",{
          data: docs,
          user: req.user
        })
      } else {
        console.log("falid"+err);
      }
    }); 
    
  }
);



router.get("/doctor/delete/:id", (req,res) =>{
  User.findByIdAndRemove(req.params.id, (err, doc) =>{
    if (!err) {
      res.redirect("../../login")
    }
  })
});



//Specialties
router.get("/specialites",
ensureAuthenticated,
ensureRole("Admin"),
function (req, res, next) { 
  Specialitie.find((err, docs) => {
    if (!err) {
      res.render("pages/admin/specialities",{
        data: docs
      })
    } else {
      console.log("falid"+err);
    }
  });
 });

 router.post("/specialites", (req, res) => {
  const { body } = req;
  const { specialitie } = body;
  const newSpecialitie = new Specialitie({
    specialitie,
  });
  newSpecialitie
    .save()
    .then((result) => {
      if (result != null) {
        req.flash(
          "success_msg",
          specialitie + " bien enregistré"
        );
        res.redirect("/specialites")
      } else {
        console.log("vide");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/delete/:id", (req,res) =>{
  Specialitie.findByIdAndRemove(req.params.id, (err, doc) =>{
    if (!err) {
      res.redirect("../specialites")
    }
  })
});




router.get("/login", (req, res) => {
  if (req.user) {
    if (req.user.Role == "Doctor") {
      if (req.user.Accepte == true) {
        res.redirect("/doctor-account");
      } else {
        res.render("pages/login");
      }
    }
    if (req.user.Role == "Client")  {
      res.redirect("/user-account");
    }
    if (req.user.Role == "Admin") {
      res.redirect("/admin-account");
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
      if (req.user.Accepte == true) {
        res.redirect("/doctor-account");
      } else {
        res.render("pages/login");
      }
    } 
    if (req.user.Role == "Client")  {
      res.redirect("/user-account");
    }
    if (req.user.Role == "Admin") {
      res.redirect("/admin-account");
    }
  }
);
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You Are successfully logged out");
  res.redirect("/login");
});


router.get("/doctors", function (req, res, next) { 
  User.find((err, docs) => {
    if (!err) {
      res.render("pages/doctors",{
        data: docs
      })
    } else {
      console.log("falid"+err);
    }
  });
 });
module.exports = router;