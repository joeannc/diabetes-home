const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash-plus");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

// Passport config
require("./config/passport")(passport);

app.use(express.static("public"));
// app.use(express.static("images"));
app.use(cors());
const exphbs = require("express-handlebars");
var hbs = require("handlebars");
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: "hbs",
  })
);
app.set("view engine", "hbs");
// app.set("views", path.join(__dirname, "views"));

// Connect to database
require("./models/database");

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session
app.use(
  session({
    secret: "web",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "strict",
      httpOnly: true,
      secure: app.get("env") === "production",
      maxAge: 3600000
    },
  })
);

// Passport middleware
// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());

// Connect flash
app.use(flash());
app.use((req, res, next) => {
  app.locals.successMessage = req.flash("successMessage");
  app.locals.errorMessage = req.flash("errorMessage");
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "js")));

// automatically redirect the web to about diabetes page
app.get("/", (req, res) => {
  res.redirect("/aboutDiabetes");
});

app.get("/aboutDiabetes", (req, res) => {
  res.render("aboutDiabetes", {
    title: "About Diabetes",
    style1: "patientAll.css",
    style2: "about.css",
    login: req.session.patient_email,
  });
});

app.get("/aboutThisWebsite", (req, res) => {
  res.render("aboutThisWebsite", {
    title: "About Diabetes",
    style1: "patientAll.css",
    style2: "about.css",
    login: req.session.patient_email,
  });
});


// set up routes
const patientRouter = require("./routes/patientRouter.js");
const clinicianRouter = require("./routes/clinicianRouter.js");
const { $where } = require("./models/clinicianSchema");

// handlers for sub pages
app.use("/patient", patientRouter);
app.use("/clinician", clinicianRouter);

app.listen(PORT, () => console.log(`Serve started on port ${PORT}`));

module.exports = app;
