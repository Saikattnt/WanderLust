const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // to ensure that no two users have the same email
    lowercase: true, // to convert email to lowercase
    trim: true, // to remove any leading or trailing whitespace
  },
  username: {
    type: String,
    required: true,
    unique: true, // to ensure that no two users have the same username
    trim: true, // to remove any leading or trailing whitespace
  },
  createdAt: {
    type: Date,
    default: Date.now, // to set the current date and time when the user is created
  },

});

UserSchema.plugin(passportLocalMongoose, {usernameLowerCase: false}); // //we used plug in for the "passport-local-mongoose" to automatically create username and hashing and salt function
module.exports = mongoose.model("User", UserSchema);
