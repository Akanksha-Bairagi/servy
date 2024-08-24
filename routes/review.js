const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

router.route("/")
  .post(isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;
