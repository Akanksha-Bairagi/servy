const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
  });

  router.post("/signup", wrapAsync(async (req, res) => {

    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to nestQuest");
      res.redirect("/listings");
      }); 
  
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup"); 
    }
  
  })
  );


  router.get("/login", (req, res) => {
    res.render("users/login.ejs");
  });

  // router.post("/login",
  // saveRedirectUrl,
  // passport.authenticate("local", {
  //   failureRedirect: "/login",
  //   failureFlash: true, 
  // }), 
  // async (req, res) => {
  //   req.flash("success", "Welcome to nestQuest");
  //   let redirectUrl = res.locals.redirectUrl || "/listings";
  //   res.redirect(redirectUrl);
  // });


  // user.js
router.post("/login",
saveRedirectUrl,
passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}),
async (req, res) => {
    // Successful login logic
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}
);


  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Logged you out!");
      res.redirect("/listings");
    });
  });
  

  module.exports = router;




  








  
  // // router.post("/signup", wrapAsync(async (req, res) => {
  // //   try {
  // //     let { username, email, password } = req.body;
  // //     const newUser = new User({ email, username });
  // //     const registeredUser = await User.register(newUser, password);

  // //     req.flash("success", "Welcome to nestQuest");
  // //     res.redirect("/listings");
  // //   } catch (e) {
  // //     req.flash("error", e.message);
  // //     res.redirect("/signup");
  // //   }
  // // }));

  // router.post("/signup", wrapAsync(async (req, res) => {
  //   try {
  //     let { username, email, password } = req.body;
  //     const newUser = new User({ email, username });
  //     const registeredUser = await User.register(newUser, password);
  //     console.log(registeredUser);
      
  //     // Use req.login to log in the user
  //     req.login(registeredUser, (err) => {
  //       if (err) {
  //         return next(err);
  //       }
        
  //       req.flash("success", "Welcome to nestQuest");
  //       res.redirect("/listings");
  //     });
  //   } catch (e) {
  //     req.flash("error", "Registration failed. Please try again.");
  //     res.redirect("/signup");
  //   }
  // }));
  
  
  // router.get("/login", (req, res) => {
  //   res.render("users/login.ejs");
  // });
  
  // router.post("/login", passport.authenticate("local", {
  //   failureRedirect: "/login", // Redirect to the login page on login failure
  //   failureFlash: true,
  // }), async (req, res) => {
  //   req.flash("success", "Welcome to nestQuest");
  //   res.redirect("/listings");
  // });
  
  // router.get("/logout", (req, res, next) => {
  //   req.logout((err) => {
  //     if (err) {
  //       return next(err);
  //     }
  //     req.flash("success", "Logged you out!");
  //     res.redirect("/listings");
  //   });
  // });
  
  // module.exports = router;