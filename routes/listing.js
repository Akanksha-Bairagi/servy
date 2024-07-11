const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");





// const validateListing = (req, res, next) => {
//     const { error } = listingSchema.validate(req.body);
//     if (error) {
//       const errMsg = error.details.map((el) => el.message).join(",");
//       next(new ExpressError(400, errMsg));
//     } else {
//       next();
//     }
//   };

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
  //New Route
  router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
  });
  
//   //Show Route
//  router.get(
//     "/:id",
//      wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate({
//       path: "reviews",
//       model: Review, // Specify the Review model for populating reviews
//     })
//     .populate("owner");
//     if(!listing){
//       req.flash("error", "listing you requested doesn't exist!");
//       res.redirect("/listings");
//     } 
//      res.render("listings/show.ejs", { listing });
//    }));
  
  


//this is different very old
  // router.get("/:id", wrapAsync(async (req, res) => {
  //   let { id } = req.params;
  //   const listing = await Listing.findById(id).populate({
  //     path: "reviews",
  //     model: Review, // Specify the Review model for populating reviews
  //   });
    
  //   console.log(listing.reviews); // Check the populated reviews
  
  //   res.render("listings/show.ejs", { listing });
  // }));



  //show route
  router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    try {
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" } // Populate the author field of reviews
            })
            .populate("owner");
        if (!listing) {
            req.flash("error", "Listing you requested doesn't exist!");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.error("Error:", err);
        req.flash("error", "Something went wrong!");
        res.redirect("/listings");
    }
}));





  //Create Route
router.post(
    "/", 
    isLoggedIn,
    validateListing,
    wrapAsync(async (req, res, next) => {
     let result = listingSchema.validate(req.body);
     console.log(result);
      const newListing = new Listing(req.body.listing);
      console.log(req.user);
      newListing.owner = req.user._id;
      await newListing.save();
      req.flash("success", "new listing created!");
      res.redirect("/listings");
    })
  );
    
  
  
  //Edit Route
router.get("/:id/edit", isLoggedIn,
 isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "listing you requested doesn't exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  }));
  
  //Update Route
  router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }));



  //Delete Route
router.delete("/:id", isLoggedIn,
 isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  }));

  module.exports = router;