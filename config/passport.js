const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Model
const Clinician = require("../models/clinicianSchema");
const HealthRecords = require("../models/recordSchema");
const { hash } = require("bcryptjs");
const { is } = require("express/lib/request");

// This function create a object that use to decide
// which schema will the passport.deserializeUser use.
// idea comes from https://github.com/jaredhanson/passport/issues/50
function SessionConstructor(userId, userGroup) {
  this.userId = userId;
  this.userGroup = userGroup;
}

module.exports = function (passport) {
  passport.serializeUser(function (userObject, done) {
    var userGroup;
    var userId;
    const userPrototype = Object.getPrototypeOf(userObject);
    if (userPrototype === HealthRecords.Patient.prototype) {
      userGroup = "patient";
    } else if (userPrototype === Clinician.prototype) {
      userGroup = "clinician";
    }
    const sessionConstructor = new SessionConstructor(userObject._id, userGroup);
    done(null, sessionConstructor);
  });

  passport.deserializeUser(function (sessionConstructor, done) {
    if (sessionConstructor.userGroup == "patient") {
      HealthRecords.Patient.findById(
        { _id: sessionConstructor.userId },
        (err, user) => {
          done(err, user);
        }
      );
    } else if (sessionConstructor.userGroup == "clinician") {
      Clinician.findById({ _id: sessionConstructor.userId }, (err, user) => {
        done(err, user);
      });
    }
  });

  passport.use(
    "patient-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true, // req will be passed as the first argument to the verify callback.
      },
      function (req, username, password, done) {
        // Match clinician
        HealthRecords.Patient.findOne({
          email: username,
        })
          .then((patient) => {
            if (!patient) {
              return done(
                null,
                false,
                req.flash("errormessage", "⚠️ Email does not exist!")
              ); // null is the error, false is the clinician
            }
            // Match password
            bcrypt.compare(
              password.toString(),
              patient.password,
              (err, isMatch) => {
                // console.log(Clinician.password);
                // console.log(password);
                if (err) throw err;
                if (isMatch) {
                  req.session.patient_email = username;
                  return done(null, patient);
                } else {
                  return done(
                    null,
                    false,
                    req.flash("errormessage", "⚠️ Password incorrect!")
                  );
                }
              }
            );
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.use(
    "clinician-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true, // req will be passed as the first argument to the verify callback.
      },
      function (req, username, password, done) {
        // Match clinician
        Clinician.findOne({
          email: username,
        })
          .then((clinician) => {
            if (!clinician) {
              return done(
                null,
                false,
                req.flash("errormessage", "⚠️ Email does not exist!")
              ); // null is the error, false is the clinician
            }
            // Match password
            bcrypt.compare(
              password.toString(),
              clinician.password,
              (err, isMatch) => {
                // console.log(Clinician.password);
                // console.log(password);
                if (err) throw err;
                if (isMatch) {
                  req.session.clinician_email = username;
                  // console.log(req.session.clinician_email);
                  return done(null, clinician);
                } else {
                  return done(
                    null,
                    false,
                    req.flash("errormessage", "⚠️ Password incorrect!")
                  );
                }
              }
            );
          })
          .catch((err) => console.log(err));
      }
    )
  );
};
