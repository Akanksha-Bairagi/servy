const Review = require("../models/review");
const Listing = require("../models/listing");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

module.exports.createReview = async (req, res) => {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) {
        return res.status(404).send('Listing not found');
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await listing.save();
    await newReview.save();
    req.flash("success", "Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
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
};
