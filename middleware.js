const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Login to create listing!");
        return res.redirect("/login");
    }
    next();
};

// Middleware to save the original URL for redirect after login
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear the saved URL after using it
    }
    next();
};

// Middleware to check if the user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params; // Extract id from req.params
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!listing.owner.equals(req.user._id)) { // Check if the logged-in user is the owner
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }

        next(); // Call next() if the user is the owner
    } catch (error) {
        console.error("Error in isOwner middleware:", error);
        req.flash("error", "An error occurred while checking ownership");
        res.redirect("/listings"); // Redirect to a safe page
    }
};

// Middleware to validate listing data
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        next(new ExpressError(400, errMsg));
    } else {
        next();
    }
};

// Middleware to validate review data
module.exports.validateReview = (req, res, next) => {
    const { rating, comment } = req.body.review;

    const { error } = reviewSchema.validate({ review: { rating, comment } });

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        req.flash("error", errMsg);
        return res.redirect(`/listings/${req.params.id}`);
    } else {
        next();
    }
};

// Middleware to check if the user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params; // Extract id and reviewId from req.params
        const review = await Review.findById(reviewId);

        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }

        if (!review.author.equals(req.user._id)) { // Check if the logged-in user is the author
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }

        next(); // Call next() if the user is the author
    } catch (error) {
        console.error("Error in isReviewAuthor middleware:", error);
        req.flash("error", "An error occurred while checking authorship");
        res.redirect(`/listings/${id}`); // Redirect to a safe page
    }
};
