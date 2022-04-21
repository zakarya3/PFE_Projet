const LocalStrategy = require("passport-local").Strategy;
//USER MODEL
const User = require("../models/User");
module.exports = function (passport) {
  passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ email: username })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "Email n'existe pas !",
              type: "error",
            });
          }
          //Match password
          if (password == user.password) {
             return done(null, user);
          } else {
            return done(null, false, {
              message: "Email ou Mot de pass incorrect",
              type: "error",
            });
          }
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
