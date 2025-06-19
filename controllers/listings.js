const Listing = require("../models/listings");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.ShowListing = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you are looking for does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
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
