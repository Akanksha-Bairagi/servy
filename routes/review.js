const express = require("express");
const router = express.Router({ mergeParams:true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");



// const validateReview = (req, res, next) => {
//   const { rating, comment } = req.body.review; 

//   const { error } = reviewSchema.validate({ review: { rating, comment } }); 

//   if (error) {
//     const errMsg = error.details.map((el) => el.message).join(",");
//     req.flash("error", errMsg);
//     return res.redirect(`/listings/${req.params.id}`);
//   } else {
//     next();
//   }
// };


// POST route to create a review
router.post("/",
isLoggedIn,
validateReview,
wrapAsync(async (req, res) => {
  const { listingId } = req.body;
  const listing = await Listing.findById(listingId);
  // console.log('Listing ID:', listingId);
  if (!listing) {
    return res.status(404).send('Listing not found');
  }
  // const newReview = new Review(req.body.review);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  console.log(newReview);
  listing.reviews.push(newReview);
  await listing.save();
  await newReview.save();
  req.flash("success", "Review Created!");
  res.redirect(`/listings/${listing._id}`); 
}));


//delete route 
router.delete("/:reviewId",
isLoggedIn,
isReviewAuthor,
 wrapAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { listingId } = req.body;

  try {
    if (!listingId) {
      console.error("Listing ID not found in the request.");
      return res.status(400).send('Listing ID not provided');
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      console.error("Listing not found for ID:", listingId);
      return res.status(404).send('Listing not found');
    }

    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error in delete review:", err);
    return res.status(500).send('Internal Server Error');
  }
}));

// // DELETE REVIEW
// router.delete("/:reviewId", wrapAsync(async (req, res) => {
//   const { reviewId } = req.params;
//   await Review.findByIdAndDelete(reviewId);
//   // res.redirect("/listings"); 
//   res.redirect(`/listings/${listing._id}`); 

// }));

module.exports = router;




