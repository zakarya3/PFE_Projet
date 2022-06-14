const { Mongoose } = require("mongoose");
const passport = require("passport");
const nodemailer = require('nodemailer');
const { ensureAuthenticated, ensureRole } = require("../config/auth");
const User = require("../models/User");
const Specialitie = require('../models/Specialitie');
const Rdv = require('../models/Rdv');
const Ord = require('../models/Ord');
const router = require("express").Router();
router.get("/", (req, res) => {
  res.render("pages/index");
});

router.get("/test", (req, res) => {
  const transporter = nodemailer.createTransport({
    host : "smtp.gmail.com",
    auth : {
        user : "wazarcontact@gmail.com",
        pass : "ekxgzffdcxszyfqk"
    }
  });

  const option ={
      from : "wazarcontact@gmail.com",
      to : "zakaria.aanni@gmail.com",
      subject : "Rendez-vous chez le doctor ",
      text : "Votre rendez-vous a été confirmé dans le "
  };

  transporter.sendMail(option, function (err, info) { 
      if (err) {
          console.log(err);
          return;
      }
      console.log("sent: "+info.response);
  });
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
      res.redirect("/user-account");
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
      const idp = doc.idpatient;
      const email = req.user.email;
      const dateRdv = doc.date;
      const doctorName = req.user.name;
      User.findOne({name: idp}, (err, docs) => {
        const emailUser = docs.email;
        const transporter = nodemailer.createTransport({
            host : "smtp.gmail.com",
            auth : {
                user : "wazarcontact@gmail.com",
                pass : "ekxgzffdcxszyfqk"
            }
        });
        
        const option ={
            from : "wazarcontact@gmail.com",
            to : emailUser,
            subject : "Rendez-vous chez le doctor "+doctorName,
            text : "Votre rendez-vous a été confirmé dans le "+dateRdv
        };
        
        transporter.sendMail(option, function (err, info) { 
            if (err) {
                console.log(err);
                return;
            }
            console.log("sent: "+info.response);
        });
      });
      res.redirect("/request");
    } else {
      console.log(err);
    }
  })



});
router.get("/refuser/:id", (req, res) => {
  Rdv.findOneAndUpdate( {_id: req.params.id}, {"$set":{"status":false}}, (err, doc) =>{
    if (!err) {
      const idp = doc.idpatient;
      const email = req.user.email;
      const dateRdv = doc.date;
      const doctorName = req.user.name;
      User.findOne({name: idp}, (err, docs) => {
        const emailUser = docs.email;
        const transporter = nodemailer.createTransport({
            host : "smtp.gmail.com",
            auth : {
                user : "wazarcontact@gmail.com",
                pass : "ekxgzffdcxszyfqk"
            }
        });
        
        const option ={
            from : "wazarcontact@gmail.com",
            to : emailUser,
            subject : "Rendez-vous chez le doctor "+doctorName,
            text : "Votre rendez-vous a été refuser."
        };
        
        transporter.sendMail(option, function (err, info) { 
            if (err) {
                console.log(err);
                return;
            }
            console.log("sent: "+info.response);
        });
      });
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

router.get("/details/:id",
  ensureAuthenticated,
  ensureRole("Doctor"),
  (req, res) => {
    User.findOne({name: req.params.id}, (err, docs) => {
      const patientName = docs.name;
      Rdv.find({idpatient: patientName}, (err, doc) => {
      
        if (!err) {
          res.render("pages/doctor/details",{
            data: docs,
            dataPat: doc,
            user: req.user
          })
        } else {
          console.log("falid"+err);
        }
      });
    }); 
    
  }
);

router.get("/ordonnace/:id",
  ensureAuthenticated,
  ensureRole("Doctor"),
  (req, res) => {
    User.findOne({name: req.params.id}, (err, docs) => {
      const patientName = docs.name;
      Rdv.find({idpatient: patientName}, (err, doc) => {
      
        if (!err) {
          res.render("pages/doctor/ordonnace",{
            data: docs,
            dataPat: doc,
            user: req.user
          })
        } else {
          console.log("falid"+err);
        }
      });
    }); 
    
  }
);

router.post("/ordonnace/:id", (req, res) => {
  const { body } = req;
  const { patient, medecin, ft_md, sd_md, td_md, fd_md, fvd_md, sxt_md, message, address, phone, price} = body;
  const newOrd = new Ord({
    patient,
    medecin,
    ft_md,
    sd_md,
    td_md,
    fd_md,
    fvd_md, 
    sxt_md,
    message,
    price,
  });
  newOrd
    .save()
    .then((result) => {
      if (result != null) {
        User.findOne({name: req.params.id}, (err, docs) => {
          const emailUser = docs.email;
          const patient = body.patient;
          const medecin = body.medecin;
          const ft_md = body.ft_md;
          const sd_md = body.sd_md;
          const td_md = body.td_md;
          const fvd_md = body.fvd_md; 
          const fd_md = body.fd_md;
          const sxt_md = body.sxt_md;
          const message = body.message; 
          const phone = body.phone;
          const address = body.address;
          const price = body.price;
          const transporter = nodemailer.createTransport({
              host : "smtp.gmail.com",
              auth : {
                  user : "wazarcontact@gmail.com",
                  pass : "ekxgzffdcxszyfqk"
              }
          });
          
          const option ={
              from : "wazarcontact@gmail.com",
              to : emailUser,
              subject : "Ordonnace",
              html : `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
              
              <head>
                  <meta charset="UTF-8">
                  <meta content="width=device-width, initial-scale=1" name="viewport">
                  <meta name="x-apple-disable-message-reformatting">
                  <meta http-equiv="X-UA-Compatible" content="IE=edge">
                  <meta content="telephone=no" name="format-detection">
                  <title></title>
                  <!--[if (mso 16)]>
                                <style type="text/css">
                                a {text-decoration: none;}
                                </style>
                                <![endif]-->
                  <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
                  <!--[if gte mso 9]>
                            <xml>
                                <o:OfficeDocumentSettings>
                                <o:AllowPNG></o:AllowPNG>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                                </o:OfficeDocumentSettings>
                            </xml>
                            <![endif]-->
              </head>
              
              <body data-new-gr-c-s-loaded="14.1062.0">
                  <div class="es-wrapper-color">
                      <!--[if gte mso 9]>
                                  <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                                    <v:fill type="tile" color="#ffffff"></v:fill>
                                  </v:background>
                                <![endif]-->
                      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0">
                          <tbody>
                              <tr>
                                  <td class="esd-email-paddings" valign="top">
                                      <table cellpadding="0" cellspacing="0" class="es-content esd-header-popover" align="center">
                                          <tbody>
                                              <tr>
                                                  <td class="esd-stripe" align="center" esd-custom-block-id="392285">
                                                      <table class="es-content-body" width="750" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="esd-structure es-p15t es-p15b es-p20r es-p20l" align="left">
                                                                      <table width="100%" cellspacing="0" cellpadding="0">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td class="esd-container-frame" width="710" valign="top" align="center">
                                                                                      <table width="100%" cellspacing="0" cellpadding="0">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td class="esd-block-text es-infoblock" align="center" esd-links-underline="none">
                                                                                                      <p><a target="_blank" href="https://viewstripo.email" style="text-decoration: none;">View email in your browser</a></p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table cellpadding="0" cellspacing="0" class="es-header" align="center">
                                          <tbody>
                                              <tr>
                                                  <td class="esd-stripe" align="center" bgcolor="#efefef" style="background-color: #efefef;">
                                                      <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="750">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="esd-structure es-p10t es-p10b es-p20r es-p20l" align="left">
                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td width="710" class="es-m-p0r esd-container-frame" valign="top" align="center">
                                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td align="center" class="esd-block-text">
                                                                                                      <p style="font-size: 32px; line-height: 120%; color: #391716;">${medecin}</p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td class="esd-structure es-p20t es-p30r es-p30l" align="left">
                                                                      <!--[if mso]><table width="690" cellpadding="0" cellspacing="0"><tr><td width="335" valign="top"><![endif]-->
                                                                      <table cellpadding="0" cellspacing="0" class="es-left" align="left">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td width="335" class="es-m-p20b esd-container-frame" align="left">
                                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td align="left" class="esd-block-text">
                                                                                                      <p style="font-size: 24px;">Phone : ${phone}</p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                      <!--[if mso]></td><td width="20"></td><td width="335" valign="top"><![endif]-->
                                                                      <table cellpadding="0" cellspacing="0" class="es-right" align="right">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td width="335" align="left" class="esd-container-frame">
                                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td align="left" class="esd-block-text">
                                                                                                      <p style="font-size: 24px;">Adresse : ${address}</p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                      <!--[if mso]></td></tr></table><![endif]-->
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table class="es-content" cellspacing="0" cellpadding="0" align="center">
                                          <tbody>
                                              <tr>
                                                  <td class="esd-stripe" align="center">
                                                      <table class="es-content-body" style="background-color: #ffffff;" width="750" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="esd-structure es-p30t es-p30b es-p20r es-p20l" align="left">
                                                                      <table width="100%" cellspacing="0" cellpadding="0">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td class="es-m-p0r esd-container-frame" width="710" valign="top" align="center">
                                                                                      <table width="100%" cellspacing="0" cellpadding="0">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td align="center" class="esd-block-image es-p40r es-p40l" style="font-size: 0px;">
                                                                                                      <a target="_blank" href="https://viewstripo.email"><img class="adapt-img" src="https://img.freepik.com/free-vector/health-day-background-design_1142-709.jpg?t=st=1654721615~exp=1654722215~hmac=aeabe492e488c0c121799e90817d9c3b317f1d23891d57831326b2c8ab760aa9&w=740" alt style="display: block;" width="480"></a>
                                                                                                  </td>
                                                                                              </tr>
                                                                                              <tr>
                                                                                                  <td align="center" class="esd-block-text">
                                                                                                      <p style="font-size: 30px; line-height: 150%;">${patient}</p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table cellpadding="0" cellspacing="0" class="esd-footer-popover es-footer" align="center">
                                          <tbody>
                                              <tr>
                                                  <td class="esd-stripe" align="center" bgcolor="#ecebeb" style="background-color: #ecebeb;">
                                                      <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" width="750">
                                                          <tbody>
                                                              <tr>
                                                                  <td class="esd-structure es-p20" align="left" esd-custom-block-id="392284">
                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td width="710" class="esd-container-frame" align="center" valign="top">
                                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td align="left" class="esd-block-text es-p40">
                                                                                                      <p style="font-size: 28px;"><strong>${ft_md}<br>${sd_md}<br>${td_md}<br>${fd_md}<br>${fvd_md}<br>${sxt_md}<br>${message}</strong></p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td class="esd-structure es-p20t es-p30r es-p30l" align="left">
                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                          <tbody>
                                                                              <tr>
                                                                                  <td width="690" class="esd-container-frame" align="center" valign="top">
                                                                                      <table cellpadding="0" cellspacing="0" width="100%">
                                                                                          <tbody>
                                                                                              <tr>
                                                                                                  <td align="left" class="esd-block-text">
                                                                                                      <h3><a href="https://www.lecomparateurassurance.com/10-guide-mutuelle/104492-calculer-remboursement-mutuelle/prix-consultation-medecin-generaliste">Le prix de la consultation</a>&nbsp;: ${price} DH</h3>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </tbody>
                                                                                      </table>
                                                                                  </td>
                                                                              </tr>
                                                                          </tbody>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </body>
              
              </html>`
          };
          
          transporter.sendMail(option, function (err, info) { 
              if (err) {
                  console.log(err);
                  return;
              }
              console.log("sent: "+info.response);
          });
        });
        res.redirect("/doctor-account");
      } else {
        res.redirect("/admin-account");
      }
    })
    .catch((err) => {
      res.redirect("/user-account");
    });
});




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