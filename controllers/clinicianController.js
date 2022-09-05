const path = require("path");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const utility = require("../js/utility");
const sessionStorage = require("sessionstorage");
const { Patient } = require("../models/recordSchema");

// Passport config
require("../config/passport")(passport);

// Model
const Clinician = require("../models/clinicianSchema");
const HealthRecords = require("../models/recordSchema");
const { hash } = require("bcryptjs");
const { nextTick } = require("process");
const { body } = require("express-validator");

// Clinician login page
const accessLogIn = (req, res) => {
  res.render("clinicianLogIn", {
    title: "Clinician-Login",
  });
};

const handleLogout = (req, res) => {
  if (req.user) {
    req.logout();
  }
  res.redirect("/clinician/login");
};

// Access register page
const accessRegister = (req, res) => {
  res.render("clinicianRegister", {
    title: "Clinician-Register",
  });
};

// Access Clinician Notes page -- need to rewrite
const accessClinicianNotes = async (req, res) => {
  try {
    const clinician = await Clinician.findOne({
      email: req.session.clinician_email,
    }).lean();
    const patient = await HealthRecords.Patient.findOne({
      email: req.params.patient_email,
    });
    // console.log(JSON.stringify(patient.clinical_notes));
    res.render("clinicianNotes", {
      title: "Clinician-clinicianNotes",
      clinicalNote: JSON.stringify(patient.clinical_notes),
      clinician_name: clinician.screen_name,
      patient_screen_name: patient.screen_name,
      pageName: "Clinician Notes",
    });
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed");
  }
};

//Access profile page
const accessProfile = async (req, res) => {
  try {
    const clinician = await Clinician.findOne({
      email: req.session.clinician_email,
    }).lean();
    //console.log(req.params.clinician_email);
    //console.log(clinician);
    res.render("clinicianProfile", {
      title: "Clinician-Profile",
      clinician_name: clinician.screen_name,
      clinician_screenname: clinician.screen_name,
      clinician_givenname: clinician.given_name,
      clinician_familyname: clinician.family_name,
      clinician_email: clinician.email,
      clinician_bio: clinician.bio,
      pageName: "Profile",
    });
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed");
  }
};
// Access edit profile page
const accesseditProfile = async (req, res, next) => {
  try {
    const clinician = await Clinician.findOne({
      email: req.session.clinician_email,
    }).lean();

    res.render("clinicianEditProfile", {
      title: "Clinician-editProfile",
      clinician_name: clinician.screen_name,
      clinician_screenname: clinician.screen_name,
      clinician_givenname: clinician.given_name,
      clinician_familyname: clinician.family_name,
      clinician_email: clinician.email,
      clinician_bio: clinician.bio,
      pageName: "EDIT Profile",
    });
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed");
  }
};
//update new data to clinician database
const insertData = async (req, res) => {
  const clinician = await Clinician.findOne({
    email: req.session.clinician_email,
  }).lean();
  var new_bio = req.body.newbio;
  var new_screenname = req.body.screenname;

  var filter = {
    email: req.session.clinician_email,
  };

  //console.log(clinician)
  const updateRecord = await Clinician.findOneAndUpdate(
    filter,
    {
      $set: {
        bio: new_bio,
        screen_name: new_screenname,
      },
    },
    { new: true }
  );
  await updateRecord.save();
  return res.redirect("/clinician/profile");
};

//Access reset paaword page
const accessResetPassword = async (req, res) => {
  const clinician = await Clinician.findOne({
    email: req.session.clinician_email,
  }).lean();

  return res.render("clinician-Reset-Password", {
    title: "Clinician-ResetPassword",
    pageName: "Reset Password",
    clinician_name: clinician.screen_name,
  });
};

// Change password
const changePassword = async (req, res) => {
  try {
    const clinician = await Clinician.findOne({
      email: req.user.email,
    }).lean();
    if (req.body.newpsw.length < 8) {
      // check password whether less than 8 characters
      return res.render("clinician-Reset-Password", {
        title: "Clinician-ResetPassword",
        pageName: "Reset Password",
        clinician_name: clinician.screen_name,
        r_error2: true,
      });
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(req.body.newpsw)) {
      // Password does not match requirement
      return res.render("clinician-Reset-Password", {
        title: "Clinician-ResetPassword",
        pageName: "Reset Password",
        clinician_name: clinician.screen_name,
        r_error3: true,
      });
    } else if (req.body.newpsw != req.body.confirmpsw) {
      // Password does not match
      return res.render("clinician-Reset-Password", {
        title: "Clinician-ResetPassword",
        pageName: "Reset Password",
        clinician_name: clinician.screen_name,
        r_error4: true,
      });
    } else if (
      await bcrypt.compare(req.body.oldpsw.toString(), clinician.password)
    ) {
      // if password is validated, change the new_password for user
      const new_password = await bcrypt.hash(req.body.newpsw, 10);
      await Clinician.findOneAndUpdate(
        {
          email: req.user.email,
        },
        {
          password: new_password,
        },
        {
          new: true,
        }
      )
        .lean()
        .exec((err, body) => {
          if (err) return res.send(err + "error");
          req.flash("successMessage", "Reset password successfully!");
          return res.redirect("resetPassword");
        });
    } else {
      // old password doesn't pass the validation
      res.render("clinician-Reset-Password", {
        title: "Clinician-ResetPassword",
        pageName: "Reset Password",
        clinician_name: clinician.screen_name,
        old_error: true,
      });
    }
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send(err);
  }
};

// Access dashboard page
const accessDashboard = async (req, res) => {
  try {
    let today_date = utility.currentDate();
    // console.log(today_date)
    const clinician = await Clinician.findOne({
      email: req.session.clinician_email,
    }).lean();
    const patients = await HealthRecords.Patient.find({
      clinician_email: req.session.clinician_email,
    })
      .populate({
        path: "health_records",
        match: { entryDate: today_date },
      })
      .lean();

    for (i = 0; i < patients.length; i++) {
      if (patients[i].health_records[0] != undefined) {
        patients[i].judge = true;
      } else {
        patients[i].judge = false;
      }
      patients[i].health_records = patients[i].health_records[0];
      // console.log(typeof patients[i].judge)
      // console.log(patients[i].posted[0])
    }
    return res.render("clinicianDashboard", {
      title: "Clinician-Dashboard",
      patient_record: patients,
      clinician_name: clinician.screen_name,
      clinician_email: clinician.email,
      comments: patients,
      pageName: "Dashboard",
    });
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed");
  }
};

// Access Individual Patient page
const accessIndividualPatient = async (req, res) => {
  try {
    // console.log(req.session);
    let today_date = utility.currentDate();
    const patient = await HealthRecords.Patient.findOne({
      email: req.params.patient_email,
      // email: "pat@gmail.com",
    }).lean();
    //console.log(patient);

    // In case no records, use patient collections
    const clinician = await Clinician.findOne({
      email: patient.clinician_email,
      // email: "chris@gmail.com",
    }).lean();
    let records = await HealthRecords.Records.find({
      patient_email: req.params.patient_email,
      // patient_email: "pat@gmail.com"
    })
      .populate({
        path: "PatientID",
        match: { email: req.params.patient_email },
        // match: { email: "pat@gmail.com" },
      })
      .lean();
    // console.log(records);

    // sort data from the latest to previous
    records = records.sort((a, b) => {
      let c = Date.parse(a.entryDate);
      let d = Date.parse(b.entryDate);
      return c > d ? -1 : 1;
    });

    let bloodglucose = patient.Bloodglucose;
    let insulin = patient.Insulin;
    let steps = patient.Steps;
    let weight = patient.Weight;
    if (patient.supportMessage) {
      var supportMessage = patient.supportMessage.data;
      var supportMessageDate = supportMessage.entryDate;
      var supportMessageTime = supportMessage.entryTime;
    } else {
      var supportMessage = null;
      var supportMessageDate = null;
      var supportMessageTime = null;
    }

    if (patient.clinical_notes.length == 0) {
      var clinicalNoteLength = 0;
      var AllclinicalNote = null;
      var clinicalNote = null;
      var clinicalNoteDate = null;
      var clinicalNoteTime = null;
    } else {
      var clinicalNoteLength = patient.clinical_notes.length - 1;
      var AllclinicalNote = patient.clinical_notes;
      var clinicalNote = AllclinicalNote[clinicalNoteLength].data;
      var clinicalNoteDate = AllclinicalNote[clinicalNoteLength].entryDate;
      var clinicalNoteTime = AllclinicalNote[clinicalNoteLength].entryTime;
    }

    if (!bloodglucose.requirement) {
      bloodglucose.require = "No";
      bloodglucose.upper_value = "——";
      bloodglucose.lower_value = "——";
    } else {
      bloodglucose.require = "Yes";
    }
    if (!insulin.requirement) {
      insulin.require = "No";
      insulin.upper_value = "——";
      insulin.lower_value = "——";
    } else {
      insulin.require = "Yes";
    }
    if (!steps.requirement) {
      steps.require = "No";
      steps.upper_value = "——";
      steps.lower_value = "——";
    } else {
      steps.require = "Yes";
    }
    if (!weight.requirement) {
      weight.require = "No";
      weight.upper_value = "——";
      weight.lower_value = "——";
    } else {
      weight.require = "Yes";
    }

    if (patient === null) {
      res.status(404);
      return res.send("Patient not found");
    }
    res.render("clinicianIndividualPatient", {
      title: "Clinician-IndividualPatient",
      patient_screen_name: patient.screen_name,
      clinician_name: clinician.screen_name,
      clinician_email: clinician.email,
      pageName: patient.email,
      records: records,
      patient_email: patient.email,
      subject: patient,
      bloodglucose_require: bloodglucose.require,
      bloodglucose_lower: bloodglucose.lower_value,
      bloodglucose_upper: bloodglucose.upper_value,
      weight_require: weight.require,
      weight_lower: weight.lower_value,
      weight_upper: weight.upper_value,
      insulin_require: insulin.require,
      insulin_lower: insulin.lower_value,
      insulin_upper: insulin.upper_value,
      steps_require: steps.require,
      steps_lower: steps.lower_value,
      steps_upper: steps.upper_value,
      supportMessage: supportMessage,
      supportMessageDate: supportMessageDate,
      supportMessageTime: supportMessageTime,
      clinicalNote: clinicalNote,
      clinicalNoteDate: clinicalNoteDate,
      clinicalNoteTime: clinicalNoteTime,
    });
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed");
  }
};

// Access Patient Registration page
const accessPatientRegistration = async (req, res) => {
  try {
    const clinician = await Clinician.findOne({
      email: req.session.clinician_email,
    });
    return res.render("clinicianPatientRegistration", {
      title: "Patient Registration",
      clinician_name: clinician.screen_name,
      pageName: "Patient Registration",
    });
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed.");
  }
};

// Patient registration page
const createPatientAccounr = async (req, res) => {
  const clinician = await Clinician.findOne({
    email: req.session.clinician_email,
  }).lean();
  let {
    firstname,
    lastname,
    screenname,
    r_year,
    email,
    password,
    password2,
    bio,
    bg,
    bg_upper,
    bg_lower,
    we,
    we_upper,
    we_lower,
    ins,
    ins_upper,
    ins_lower,
    st,
    st_upper,
    st_lower,
  } = req.body;
  let num_require = 0;
  // console.log(r_year)
  // console.log(bg === "true")
  if (bg === "true") {
    num_require += 1;
    bg = true;
    bg_upper = parseFloat(bg_upper);
    bg_lower = parseFloat(bg_lower);
  } else {
    bg = false;
    bg_upper = null;
    bg_lower = null;
  }

  if (we === "true") {
    num_require += 1;
    we = true;
    we_upper = parseFloat(we_upper);
    we_lower = parseFloat(we_lower);
  } else {
    we = false;
    we_upper = null;
    we_lower = null;
  }

  if (ins === "true") {
    num_require += 1;
    ins = true;
    ins_upper = parseFloat(ins_upper);
    ins_lower = parseFloat(ins_lower);
  } else {
    ins = false;
    ins_upper = null;
    ins_lower = null;
  }

  if (st === "true") {
    num_require += 1;
    st = true;
    st_upper = parseFloat(st_upper);
    st_lower = parseFloat(st_lower);
  } else {
    st = false;
    st_upper = null;
    st_lower = null;
  }

  // check password whether less than 8 characters
  if (password.length < 8) {
    return res.render("clinicianPatientRegistration", {
      title: "Patient Registration",
      clinician_name: clinician.screen_name,
      pageName: "Patient Registration",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      r_year: r_year,
      email: email,
      r_error2: true,
    });
  }

  // Password does not match requirement
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    return res.render("clinicianPatientRegistration", {
      title: "Patient Registration",
      clinician_name: clinician.screen_name,
      pageName: "Patient Registration",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      r_year: r_year,
      email: email,
      r_error3: true,
    });
  }

  // Password does not match
  if (password !== password2) {
    return res.render("clinicianPatientRegistration", {
      title: "Patient Registration",
      clinician_name: clinician.screen_name,
      pageName: "Patient Registration",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      r_year: r_year,
      email: email,
      r_error4: true,
    });
  }

  // Invalid email form
  if (!/^[A-Za-z\._\-0-9]*[@][A-Za-z\.]*[\.][a-z]{2,4}$/.test(email)) {
    return res.render("clinicianPatientRegistration", {
      title: "Patient Registration",
      clinician_name: clinician.screen_name,
      pageName: "Patient Registration",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      r_year: r_year,
      r_error5: true,
    });
  }

  // Validation passed
  try {
    const patient = await HealthRecords.Patient.findOne({
      email: email,
    }); // If email existed
    if (patient) {
      return res.render("clinicianPatientRegistration", {
        title: "Patient Registration",
        clinician_name: clinician.screen_name,
        pageName: "Patient Registration",
        firstname: firstname,
        lastname: lastname,
        screenname: screenname,
        r_year: r_year,
        r_error1: true,
      });
    } else {
      // email does not exist
      // console.log(req.session.clinician_email);
      const newPatient = new HealthRecords.Patient({
        given_name: firstname,
        family_name: lastname,
        screen_name: screenname,
        year_of_birth: r_year,
        bio: bio,
        email: email,
        clinician_email: req.session.clinician_email,
        password: password,
        Bloodglucose: {
          requirement: bg,
          upper_value: bg_upper,
          lower_value: bg_lower,
        },
        Weight: {
          requirement: we,
          upper_value: we_upper,
          lower_value: we_lower,
        },
        Insulin: {
          requirement: ins,
          upper_value: ins_upper,
          lower_value: ins_lower,
        },
        Steps: {
          requirement: st,
          upper_value: st_upper,
          lower_value: st_lower,
        },
        num_require: num_require,
        engagement_rate: 0,
      }); // Hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newPatient.password, salt, (err, hash) => {
          if (err) throw err;
          newPatient.password = hash;
          newPatient
            .save()
            .then((patient) => {
              req.flash(
                "successMessage",
                "Success! You can keep registering patient account"
              );
              return res.redirect("/clinician/patientRegistration");
            })
            .catch((err) => console.log(err));
        });
      });
    }
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send(err);
  }
};

// Access Individual Patient page
const accessEditRequirement = async (req, res) => {
  const clinician = await Clinician.findOne({
    email: req.session.clinician_email,
    // email: "chris@gmail.com",
  }).lean();
  const patient = await HealthRecords.Patient.findOne({
    email: req.params.patient_email,
  });
  // console.log(patient);
  res.render("clinicianEditRequirement", {
    title: "Clinician-EditRequirement",
    clinician_name: clinician.screen_name,
    pageName: "Edit Requirement",
    patient_email: req.params.patient_email,
    bloodglucose: patient.Bloodglucose.requirement,
    bg_Upper: patient.Bloodglucose.upper_value,
    bg_Lower: patient.Bloodglucose.lower_value,
    weight: patient.Weight.requirement,
    w_Upper: patient.Weight.upper_value,
    w_Lower: patient.Weight.lower_value,
    insulin: patient.Insulin.requirement,
    in_Upper: patient.Insulin.upper_value,
    in_Lower: patient.Insulin.lower_value,
    steps: patient.Steps.requirement,
    s_Upper: patient.Steps.upper_value,
    s_Lower: patient.Steps.lower_value,
  });
};

const handleEditRequirement = async (req, res, next) => {
  const {
    yes_no_BG,
    lower_BG,
    upper_BG,
    yes_no_WE,
    lower_WE,
    upper_WE,
    yes_no_IN,
    lower_IN,
    upper_IN,
    yes_no_EX,
    lower_EX,
    upper_EX,
  } = req.body;
  let to_update = {};
  try {
    const patient = await HealthRecords.Patient.findOne({
      email: req.params.patient_email,
    }).lean();
    // check bloodglucose
    if (patient.Bloodglucose.requirement == true) {
      if (yes_no_BG === "false") {
        // change requirement from yes to no
        to_update["Bloodglucose.requirement"] = false;
        to_update["Bloodglucose.lower_value"] = null;
        to_update["Bloodglucose.upper_value"] = null;
      } else {
        // may change the lower or upper value
        if (parseFloat(lower_BG) != patient.Bloodglucose.lower_value) {
          to_update["Bloodglucose.lower_value"] = parseFloat(lower_BG);
        }
        if (parseFloat(upper_BG) != patient.Bloodglucose.upper_value) {
          to_update["Bloodglucose.upper_value"] = parseFloat(upper_BG);
        }
      }
    } else {
      if (yes_no_BG === "true") {
        //change requirement from no to yes
        to_update["Bloodglucose.requirement"] = true;
        to_update["Bloodglucose.lower_value"] = parseFloat(lower_BG);
        to_update["Bloodglucose.upper_value"] = parseFloat(upper_BG);
      }
    }

    // check weight
    if (patient.Weight.requirement == true) {
      if (yes_no_WE === "false") {
        // change requirement from yes to no
        to_update["Weight.requirement"] = false;
        to_update["Weight.lower_value"] = null;
        to_update["Weight.upper_value"] = null;
      } else {
        // may change the lower or upper value
        if (parseFloat(lower_WE) != patient.Weight.lower_value) {
          to_update["Weight.lower_value"] = parseFloat(lower_WE);
        }
        if (parseFloat(upper_WE) != patient.Weight.upper_value) {
          to_update["Weight.upper_value"] = parseFloat(upper_WE);
        }
      }
    } else {
      if (yes_no_WE === "true") {
        //change requirement from no to yes
        to_update["Weight.requirement"] = true;
        to_update["Weight.lower_value"] = parseFloat(lower_WE);
        to_update["Weight.upper_value"] = parseFloat(upper_WE);
      }
    }

    // check insulin
    if (patient.Insulin.requirement == true) {
      if (yes_no_IN === "false") {
        // change requirement from yes to no
        to_update["Insulin.requirement"] = false;
        to_update["Insulin.lower_value"] = null;
        to_update["Insulin.upper_value"] = null;
      } else {
        // may change the lower or upper value
        if (parseFloat(lower_IN) != patient.Insulin.lower_value) {
          to_update["Insulin.lower_value"] = parseFloat(lower_IN);
        }
        if (parseFloat(upper_IN) != patient.Insulin.upper_value) {
          to_update["Insulin.upper_value"] = parseFloat(upper_IN);
        }
      }
    } else {
      if (yes_no_IN === "true") {
        //change requirement from no to yes
        to_update["Insulin.requirement"] = true;
        to_update["Insulin.lower_value"] = parseFloat(lower_IN);
        to_update["Insulin.upper_value"] = parseFloat(upper_IN);
      }
    }

    // check exercise
    if (patient.Steps.requirement == true) {
      if (yes_no_EX === "false") {
        // change requirement from yes to no
        to_update["Steps.requirement"] = false;
        to_update["Steps.lower_value"] = null;
        to_update["Steps.upper_value"] = null;
      } else {
        // may change the lower or upper value
        if (parseFloat(lower_EX) != patient.Steps.lower_value) {
          to_update["Steps.lower_value"] = parseFloat(lower_EX);
        }
        if (parseFloat(upper_EX) != patient.Steps.upper_value) {
          to_update["Steps.upper_value"] = parseFloat(upper_EX);
        }
      }
    } else {
      if (yes_no_EX === "true") {
        //change requirement from no to yes
        to_update["Steps.requirement"] = true;
        to_update["Steps.lower_value"] = parseFloat(lower_EX);
        to_update["Steps.upper_value"] = parseFloat(upper_EX);
      }
    }
    await HealthRecords.Patient.updateOne(
      { email: req.params.patient_email },
      {
        $set: to_update,
      }
    );
    res.redirect(`/clinician/AllPatients/${req.params.patient_email}`);
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send(err);
  }
};

// Log in
const handleLogin = (req, res, next) => {
  passport.authenticate(
    "clinician-login",
    {
      failureFlash: true,
      session: false,
    },
    (err, clinician) => {
      if (err) {
        return next(err);
      }

      if (!clinician) {
        return res.render("clinicianLogIn", {
          title: "Clinician-Login",
          l_error1: true,
        });
      }

      req.logIn(clinician, (err) => {
        return res.redirect("/clinician/dashboard");
      });
    }
  )(req, res, next);
};

// Clinician registration page
const createClinicianAccount = async (req, res) => {
  const {
    firstname,
    lastname,
    screenname,
    year,
    email,
    password,
    password2,
    bio,
  } = req.body;

  // console.log(req.body);

  // Check password whether less than 8 characters
  if (password.length < 8) {
    return res.render("clinicianRegister", {
      title: "Register",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      year: year,
      email: email,
      r_error2: true,
    });
  }

  // Passwor does not match requirement
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    return res.render("clinicianRegister", {
      title: "Register",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      year: year,
      email: email,
      r_error3: true,
    });
  }

  // Password does not match
  if (password !== password2) {
    return res.render("clinicianRegister", {
      title: "Register",
      firstname: firstname,
      lastname: lastname,
      screenname: screenname,
      year: year,
      email: email,
      r_error4: true,
    });
  }

  // Validation passed
  try {
    const clinician = await Clinician.findOne({
      email: email,
    });
    // If email has existed
    if (clinician) {
      return res.render("clinicianRegister", {
        title: "Register",
        firstname: firstname,
        lastname: lastname,
        screenname: screenname,
        year: year,
        email: email,
        r_error1: true,
      });
    } else {
      // email does not exist
      const newClinician = new Clinician({
        given_name: firstname,
        family_name: lastname,
        screen_name: screenname,
        year_of_birth: year,
        bio: bio,
        email: email,
        password: password,
      });
      // Hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newClinician.password, salt, (err, hash) => {
          if (err) throw err;
          // Set password to hash
          // console.log(hash)
          newClinician.password = hash;
          // Save the user
          newClinician
            .save()
            .then((clinician) => {
              req.flash(
                "successMessage",
                "You can keep registering clinician ID"
              );
              return res.redirect("/clinician/register");
            })
            .catch((err) => console.log(err));
        });
      });
    }
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send(err);
  }
};

const testing = async (req, res) => {
  const newRecord = new HealthRecords.RECORDS({
    given_name: "Pat",
    family_name: "Smith",
    patient_email: "pat@gmail.com",
    clinician_email: "chris@gmail.com",
    entryDate: "2022-04-23",
    bloodglucose: {
      requirement: false,
    },
    weight: {
      data: 100,
      exceed: true,
      requirement: true,
      comment: {
        data: "need to lose weight",
      },
    },
    insulin: {
      data: 5,
      exceed: false,
      requirement: true,
      comment: {
        data: "haha",
      },
    },
    step: {
      data: 10200,
      exceed: false,
      requirement: true,
    },
    PatientID: mongoose.Types.ObjectId("626266df781dfe57cb3e86f5"),
    completed: 3,
    status: 100,
  });
  await newRecord
    .save() // Promise-style error-handler
    .then((result) => res.send(result)) // Mongo operation was successful
    .catch((err) => res.send(err));
};

// const redirect = (req, res) => {
//   res.render("redirect-page-clinician", {
//     error_message:
//       "Access denied, this page will redirect to login page in 3s.",
//   });
// };
//push new support message and new note to clinical note in individual page
const newnote = async (req, res) => {
  var patient_email = req.params.patient_email;
  const patient = await Patient.findOne({ email: patient_email });

  var new_note = req.body.newnote;
  var new_supportMsg = req.body.supportMsg;

  let today_time = utility.currentTime();
  let today_date = utility.currentDate();

  //update patient's support message list
  if (new_supportMsg) {
    const updateMsg = await Patient.findOneAndUpdate(
      { _id: patient.id },
      {
        $set: {
          supportMessage: {
            data: new_supportMsg,
            entryDate: today_date,
            entryTime: today_time,
          },
        },
      },
      { new: true }
    );
  }

  //update patient's note list
  if (new_note) {
    const updateNoteList = await Patient.findOneAndUpdate(
      { _id: patient.id },
      {
        $push: {
          clinical_notes: {
            data: new_note,
            entryDate: today_date,
            entryTime: today_time,
          },
        },
      },
      { new: true }
    );
  }

  return res.redirect("/clinician/AllPatients/" + patient_email);
};
//Access profile page
const accessPatientProfile = async (req, res) => {

  try{
    var patient_email = req.params.patient_email;
    const patient = await Patient.findOne({ email: patient_email });
    const clinician = await Clinician.findOne({
      email: req.session.clinician_email,
    });

    res.render("clinicianPatientProfile", {
      title: "Patient-Profile",
      clinician_name:clinician.screen_name,
      pageName: "Patient Profile",
      patient_screenname: patient.screen_name,
      patient_givenname: patient.given_name,
      patient_familyname: patient.family_name,
      patient_email: patient.email,
      patient_bio:patient.bio,
    });
  }catch (err) {
    res.status(400);
    console.log(err);
    return res.send("Database query failed");
  }
};

module.exports = {
  testing,
  accessLogIn,
  handleLogin,
  accessRegister,
  createClinicianAccount,
  accessDashboard,
  accessPatientRegistration,
  accessProfile,
  accesseditProfile,
  accessIndividualPatient,
  accessEditRequirement,
  accessClinicianNotes,
  handleLogout,
  createPatientAccounr,
  handleEditRequirement,
  newnote,
  insertData,
  accessResetPassword,
  changePassword,
  accessPatientProfile,
};
