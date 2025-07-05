const Listing = require("../models/listings");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.ShowListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  const cart = req.session.cart || [];
  res.render("listings/show.ejs", { listing, user: req.user, cart });
};

module.exports.createListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  let url = req.file.path;
  let filename = req.file.filename;
  newListing.image = { url, filename };
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are loooking for does not exist");
    // flash message to show error
    return res.redirect("/listings");
  }

  let OriginalImageUrl = listing.image.url;
  OriginalImageUrl = OriginalImageUrl.replace(
    "/uploads",
    "/uploads/original/h_300,w_250"
  );
  res.render("listings/edit.ejs", { listing, OriginalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;
  const updated = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });
  if (!updated) {
    throw new ExpressError(404, "Listing not found");
  }
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updated.image = { url, filename };
  }
  await updated.save();
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found");
  }
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

module.exports.filterByCategory = async (req, res) => {
  const { category } = req.params;
  // Capitalize the first letter to match your enum, if needed
  const formattedCategory =
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  const listings = await Listing.find({ category: formattedCategory }).populate(
    "owner"
  );
  res.render("listings/index", {
    allListings: listings,
    selectedCategory: formattedCategory,
  });
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  let allListings = [];
  if (q && q.trim() !== "") {
    // Case-insensitive search on title, location, or country
    allListings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ],
    });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index", { allListings });
};

// Show Cart Page
module.exports.showCart = async (req, res) => {
  // Ensure cart is an array of objects
  let cart = req.session.cart || [];
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter((item) => item && item.id);

  // Fetch listings in the cart
  const cartListings = await Listing.find({
    _id: { $in: cart.map((item) => item.id) },
  });

  // Clean up session cart to only include valid listing objects
  req.session.cart = cartListings.map((listing) => {
    const cartItem = cart.find((item) => item.id === listing._id.toString());
    return {
      id: listing._id.toString(),
      price: cartItem ? cartItem.price : listing.price,
    };
  });

  res.render("listings/cart.ejs", {
    cartListings,
    cartCount: cartListings.length,
    sessionCart: req.session.cart || [],
  });
};

// Add to Cart Handler
module.exports.addToCart = async (req, res) => {
  try {
    console.log("===== ADD TO CART START =====");
    console.log("Session User:", req.user);
    console.log("Session Cart:", req.session.cart);
    console.log("Body:", req.body);
    console.log("Params:", req.params);

    const { id } = req.params;
    let { price } = req.body;
    price = Number(price);

    if (!price) {
      return res.status(400).json({ error: "Missing price" });
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const stringId = id.toString();

    if (!req.session.cart.some((item) => item.id === stringId)) {
      req.session.cart.push({ id: stringId, price });
    }

    req.session.cart = req.session.cart.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    if (req.user) {
      req.user.cart = req.session.cart;
      await req.user.save();
    }

    const cartCount = req.session.cart.length;
    console.log("Cart updated successfully", req.session.cart);
    return res.json({ message: "Listing added to cart!", cartCount });
  } catch (err) {
    console.error("❌ ERROR IN ADD TO CART:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Remove from Cart Handler
module.exports.removeFromCart = async (req, res) => {
  const { id } = req.params;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(
      (item) => item.id !== id.toString()
    );
    // Deduplicate by id
    req.session.cart = [
      ...new Map(req.session.cart.map((item) => [item.id, item])).values(),
    ];
    if (req.user) {
      req.user.cart = req.session.cart;
      await req.user.save();
    }
  }
  req.flash("success", "Listing removed from cart!");
  res.redirect("/listings/cart");
};
