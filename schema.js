const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0), //min value == 0 not negative
    country: Joi.string().required(),
    location: Joi.string().required(),
    image: Joi.object({
      url: Joi.string(),
      filename: Joi.string(),
    }).optional(),
    category: Joi.string()
      .valid("Beach", "Mountain", "Forest", "Room", "Trending")
      .required(), // <-- add this line
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5), //rating between 1 and 5
  }).required(),
});
