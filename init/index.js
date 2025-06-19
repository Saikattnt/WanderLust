const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data.map((obj) => ({
    ...obj,
    owner: "684b9b13e91477cdb6876609",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
