const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js"); // { obj } we req an object from schema.js file
const Listing = require("../models/listings.js");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const razorpay = require("../utils/razorpay");

// Search route
router.get("/search", wrapAsync(listingController.searchListings));

const multer = require("multer"); //to parse from form data
const { storage } = require("../cloudConfig.js");
const uplaod = multer({ storage }); // it fecth the file data form parsing and save it in uploads folder
// multer bydefault store the file in cloudinary storage
const validateListing = (req, res, next) => {
  // If a file was uploaded, add its info to req.body.listing.image
  if (req.file) {
    if (!req.body.listing) req.body.listing = {};
    req.body.listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message); // show only the message
  } else {
    next();
  }
};

router
  .route("/") // Using route() to define multiple HTTP methods for the same path;
  .get(wrapAsync(listingController.index)) //index route
  .post(
    // Create Route
    isLoggedIn("You must be logged in to create a listing"),
    uplaod.single("listing[image][url]"), //multer middleware to handle image upload
    validateListing,
    wrapAsync(listingController.createListing)
  );

// new route
// new route is placed before the show route because show route finds listings by id so its considering new as a id
router.get(
  "/new",
  isLoggedIn("Log in to create a new list"),
  listingController.renderNewForm
);

// Cart Page (GET)
router.get(
  "/cart",
  isLoggedIn("You must be logged in to view cart"),
  wrapAsync(listingController.showCart)
);

// Add to Cart (POST)
router.post(
  "/:id/add-to-cart",
  isLoggedIn("You must be logged in to add to cart"),
  wrapAsync(listingController.addToCart)
);
router.post(
  "/:id/remove-from-cart",
  isLoggedIn("You must be logged in to modify cart"),
  wrapAsync(listingController.removeFromCart)
);

router
  .route("/:id")
  .get(wrapAsync(listingController.ShowListing))
  .put(
    isLoggedIn("You must be logged in to edit a listing"),
    uplaod.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn("You must be logged in to delete a listing"),
    wrapAsync(listingController.destroyListing)
  );

// Edit Route

router.get(
  "/:id/edit",
  isLoggedIn("You must be logged in to edit a listing"),
  wrapAsync(listingController.renderEditForm)
);

// Route to filter listings by category
router.get(
  "/category/:category",
  wrapAsync(listingController.filterByCategory)
);
router.post("/rent/:id", (req, res) => {
  res.redirect(
    "/images/websites-why-you-should-never-use-under-construction-pages.jpg"
  );
});

router.post("/create-order", async (req, res) => {
  const { amount } = req.body; // amount in paise (e.g., 50000 = ₹500)
  const options = {
    amount: amount,
    currency: "INR",
    receipt: "order_rcptid_" + Math.random().toString(36).substring(7),
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
