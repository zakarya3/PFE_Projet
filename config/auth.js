module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "please login to view the resource");
    res.redirect("/login");
  },
  ensureRole : function (role) {
    return (req,res,next)  => {
      if(req.user && req.user.Role !==role){
        req.flash("error", "401 Unauthorized");
        return res.redirect("/")
      }
      next();
    }
  }
};
