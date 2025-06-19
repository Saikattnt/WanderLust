const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

const validateReview = (req, res, next) => {
  // Convert rating to a number before validation
  if (req.body.review && req.body.review.rating) {
    req.body.review.rating = Number(req.body.review.rating);
  }
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message);
  } else {
    next();
  }
};

const reviewController = require("../controllers/reviews.js");

// Reviews
// post review route
router.post("/", validateReview, wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewsId", wrapAsync(reviewController.destroyReview));

module.exports = router;
