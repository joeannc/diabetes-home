const mongoose = require("mongoose");
const utility = require("../js/utility.js");
const bcrypt = require("bcryptjs");

const clinicianSchema = new mongoose.Schema({
  given_name: {
    type: String,
    required: true,
  },
  family_name: {
    type: String,
    required: true,
  },
  screen_name: {
    type: String,
    required: true,
  },
  year_of_birth: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: utility.currentDate,
  },
  time: {
    type: String,
    default: utility.currentTime,
  },
});

clinicianSchema.methods.generateHash = function (password) {
  return bcrypt.hash(password, 10);
};

clinicianSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const CLINICIAN = mongoose.model("Clinicians", clinicianSchema);

module.exports = CLINICIAN;
