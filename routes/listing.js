const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listings = require("../controllers/listings");

// Index Route
router.get("/", wrapAsync(listings.index));

// New Route
router.get("/new", isLoggedIn, listings.renderNewForm);

// Show Route
router.get("/:id", wrapAsync(listings.showListing));

// Chaining route handlers for Create, Edit, Update, and Delete
router.route("/")
  .post(isLoggedIn, validateListing, wrapAsync(listings.createListing));

router.route("/:id")
  .get(wrapAsync(listings.showListing))
  .put(isLoggedIn, isOwner, validateListing, wrapAsync(listings.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listings.deleteListing));

router.route("/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(listings.renderEditForm));

module.exports = router;
