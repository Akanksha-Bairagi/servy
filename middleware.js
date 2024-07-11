const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Login to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;  // Clear the saved URL after using it
    }
    next();
};


module.exports.isOwner = async (req, res, next) => {
    try {
        let { id } = req.params; // Extract id from req.params
        let listing = await Listing.findById(id);
        if (!listing.owner.equals(req.user._id)) { // Check if the logged-in user is the owner
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        // Call next() if the user is the owner
        next();
    } catch (error) {
        // Handle any errors that occur during the check
        console.error("Error in isOwner middleware:", error);
        req.flash("error", "An error occurred while checking ownership");
        res.redirect(`/listings/${id}`); // Redirect to a safe page
    }
};

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(",");
      next(new ExpressError(400, errMsg));
    } else {
      next();
    }
  };

  module.exports.validateReview = (req, res, next) => {
    const { rating, comment } = req.body.review; 
  
    const { error } = reviewSchema.validate({ review: { rating, comment } }); 
  
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(",");
      req.flash("error", errMsg);
      return res.redirect(`/listings/${req.params.id}`);
    } else {
      next();
    }
  };


  module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        let { id, reviewId } = req.params; // Extract id from req.params
        let review = await Review.findById(reviewId);
        if (!review.author.equals(req.user._id)) { // Check if the logged-in user is the owner
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        // Call next() if the user is the owner
        next();
    } catch (error) {
        // Handle any errors that occur during the check
        console.error("Error in isOwner middleware:", error);
        req.flash("error", "An error occurred while checking authorship");
        res.redirect(`/listings/${id}`); // Redirect to a safe page
    }
};
