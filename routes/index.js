var express = require('express');
var router = express.Router();
const userModel=require("./users");
const pickupModel=require("./pickup");
var passport = require('passport');
//for user login
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

// router.get('/logged', , function(req, res, next) {
//   res.render("index");
// });

//register
router.post('/register', function(req,res){
  const userData = new userModel({
    username:req.body.username,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role
  });

  userModel.register(userData, req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/dashboard");
    });
  });
});

//login
router.get('/login',function(req,res){
  console.log(req.flash("error"));
  res.render("login");
}); 

router.post('/login',passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
  failureFlash: true
}), function(req,res){
});

router.get('/dashboard', isLoggedIn, async function(req, res){
      const user= await userModel.findOne({
        username: req.session.passport.user //stores username until logged in

      });
      console.log(user);
      if(user.role=='P'){
        res.render('student',{user});
      }
      else res.render('driver',{user});
      //{username: req.body.username});
});

router.get("/logout", function(req,res){
  req.logout(function(err){
    if(err) return next(err);
    res.redirect('/login');
  });
  
});

//middleware to check for authetication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// sending username to front end
router.get('/username', isAuthenticated, (req, res) => {
  res.json({ username: req.user.username });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
