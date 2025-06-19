const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId, //fetching the id according to the name to list reviews
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    enum: ["Beach", "Mountain", "Forest", "Room", "Trending"],
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
//This is a Mongoose middleware hook that runs after a findOneAndDelete operation on a Listing document (e.g., when you delete a listing).
// async (listing) => { ... }
// The function receives the deleted listing document as an argument.

// if (listing) { ... }
// Checks if a listing was actually found and deleted.

// await Review.deleteMany({ _id: { $in: listing.reviews } });
// This deletes all reviews whose _id is in the listing.reviews array.
// In other words:

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
