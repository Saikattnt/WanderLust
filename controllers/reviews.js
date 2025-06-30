const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You must be logged in to post a review.");
    return res.redirect(`/listings/${req.params.id}`);
  }
  let listing = await Listing.findById(req.params.id); //url
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  let newReview = new Review({
    ...req.body.review,
    author: req.user._id,
  });

  listing.reviews.push(newReview); // Add the review to the listing

  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewsId } = req.params;
  const review = await Review.findById(reviewsId);

  // Check if review exists and user is logged in
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }
  if (!req.user) {
    req.flash("error", "You must be logged in to delete a review.");
    return res.redirect(`/listings/${id}`);
  }

  // Only allow the author to delete
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${id}`);
  }

  await Review.findByIdAndDelete(reviewsId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } });
  req.flash("success", "Review Deleted");
  res.redirect(`/listings/${id}`);
};
