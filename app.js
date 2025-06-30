if (process.env.NODE_ENV != "production") {
  //.env only used in devolopment phase not in production phase
  require("dotenv").config();
}

console.log(process.env.SECRET);
//we can access the environment variables from env by using process.env.SECRET
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingsRouter = require("./routes/listings.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const reviewsRouter = require("./routes/review.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo"); //to store the session in mongoDB
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET, // secret to encrypt the session data
  },
  touchAfter: 24 * 3600, // time in seconds after which the session will be updated
  ttl: 7 * 24 * 60 * 60, // time to live in seconds, after which the session will be removed
});

store.on("error", function (err) {
  console.log("Session Store Error", err);
});

const sessionOptions = {
  store: store, // to store the session in mongoDB
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 1000,
    httpOnly: true, // to protect from cross-scripting attacks
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //a middleware that initialize passport
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //all the user auhteticate by the LocalStrategy and User.autheticate is used for authetication

passport.serializeUser(User.serializeUser()); // to store all the related info of the user i.e serialize user into the session
passport.deserializeUser(User.deserializeUser());
//used to remove the user i.e deserialize the user

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
  next();
});

// app.get("/demouser1", async (req, res) => {
//   let fakeUSer = new User({
//     email: "XYZ@gmail.com",
//     username: "xyz-student", //passport-local-mongoose automatically adds user name even without defining it
//   });

//   let regitserUser = await User.register(fakeUSer, "helloworld"); // it checks whether the username is unique or not, and any registration purpose
//   res.send(regitserUser);
// });
// app.get("/saikat", async (req, res) => {
//   let fakeUSer = new User({
//     email: "XYZ@gmail.com",
//     username: "xyz-student", //passport-local-mongoose automatically adds user name even without defining it
//   });

//   let regitserUser = await User.register(fakeUSer, "helloworld"); // it checks whether the username is unique or not, and any registration purpose
//   res.send(regitserUser);
// });

app.get("/", (req, res) => {
  res.redirect("/listings");
});

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message); // show only the message
  } else {
    next();
  }
};

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.post("/signup", (req, res) => {
  res.render("users/signup"); // or wherever your signup.ejs is located
});

app.get("/cart", (req, res) => {
  res.redirect("/listings/cart");
});

// app.get("/testListings", async (req, res) =>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("Sample was Saved");
//     res.send("Successfull Testing")
// });

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page not Found!"));
// });

app.use((err, req, res, next) => {
  //deconstructing express error
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

app.listen(8000, () => {
  console.log("server is listening to port 8000");
});
