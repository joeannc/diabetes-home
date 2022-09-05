const { type } = require("express/lib/response");
const { userInfo } = require("os");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// const schemas = require('../models/healthData.js');
const { Records } = require("../models/recordSchema");
const { Patient } = require("../models/recordSchema");
const { Comment } = require("../models/recordSchema");
const { BloodGlucoseLevel } = require("../models/recordSchema");
const { Insulindose } = require("../models/recordSchema");
const { Weight } = require("../models/recordSchema");
const { Steps } = require("../models/recordSchema");
const utility = require("../js/utility");
const passport = require("passport");
const sessionStorage = require("sessionstorage");
const { request } = require("http");
const { range } = require("express/lib/request");
const session = require("express-session");
const sessionstorage = require("sessionstorage");

// Passport config
require("../config/passport")(passport);

// aboutDiabetes page
const aboutDiabetes = async (req, res) => {
  const login = req.session;
  var style3 = null;
  if (login)
  {
    const patient = await Patient.findOne({ email: login.patient_email }).lean();
    var theme = patient.theme_colour;
    style3 = theme + ".css"
  }
  res.render("aboutDiabetes", {
    title: "About Diabetes",
    style1: "patientAll.css",
    style2: "about.css",
    style3: style3,
    login:  login,
  });
};

// aboutThisWebsite page
const aboutThisWebsite = async (req, res) => {
  const login = req.session;
  var style3 = null;
  if (login)
  {
    const patient = await Patient.findOne({ email: login.patient_email }).lean();
    var theme = patient.theme_colour;
    style3 = theme + ".css"
  }
  res.render("aboutThisWebsite", {
    title: "About us",
    style1: "patientAll.css",
    style2: "about.css",
    style3: style3,
    login: login,
  });
};

// Access login page
const accessLogin = (req, res) => {
  res.render("patientLogIn", {
    style1: "patientLogIn.css",
  });
};

const handleLogout = (req, res) => {
  if (req.user) {
    req.logout();
  }
  if (req.session.patient_email){
    res.header('Cache-Control', 'no-cache')
    req.session.destroy((err)=>{
      if(err){
        return console.log(err)
      }
    })
  }
  res.redirect("/patient/login");
};

// Patient Login
const handleLogin = (req, res, next) => {
  passport.authenticate(
    "patient-login",
    {
      failureFlash: true,
      session: false,
    },
    (err, patient) => {
      if (err) {
        return next(err);
      }

      if (!patient) {
        return res.render("patientLogIn", {
          l_error1: true,
          style1: "patientLogIn.css",
        });
      }
  
      req.logIn(patient, (err) => {
        return res.redirect("home");
      });
    }
  )(req, res, next);
  
};

// Home page
const homePage = async (req, res, next) => {
  const patient_email = req.session.patient_email;
  Today = utility.currentDate();
  const dataToday = await Records.findOne({
    patient_email: patient_email,
    entryDate: Today,
  });
  const patient = await Patient.findOne({ email: patient_email }).lean();
  var theme = patient.theme_colour;
  if (dataToday) {
    if (dataToday.Bloodglucose) {
      var glucoseData = dataToday.Bloodglucose.data;
    } else glucoseData = null;

    if (dataToday.Insulin) {
      var insulinData = dataToday.Insulin.data;
    } else insulinData = null;

    if (dataToday.Weight) {
      var weightData = dataToday.Weight.data;
    } else weightData = null;

    if (dataToday.Steps) {
      var stepData = dataToday.Steps.data;
    } else stepData = null;
  }
  //calculate and get patient engagement rate
  var filter = {
    patient_email: patient_email,
    entryDate: Today,
  };
  let record_list = patient.health_records;
  let current_engagement_rate =
    (record_list.length / utility.between_dates(patient.register_date, Today)) *
    100;
  current_engagement_rate = current_engagement_rate.toFixed(1);
  const updatePatientRecord = await Patient.findOneAndUpdate(
    filter,
    { $set: { engagement_rate: current_engagement_rate } },
    { new: true }
  );
  await updatePatientRecord.save();
  //check whether the engagement rate is over 80
  if (updatePatientRecord.engagement_rate >= 80) var over_80 = true;
  else over_80 = false;

  //show the top 5 patient with high engagement rate
  var patientRank = null;
  var leaderboard = await Patient.find()
    .sort({ engagement_rate: -1 })
    .limit(5)
    .lean();
  for (let i = 0; i < leaderboard.length; i++) {
    if (leaderboard[i].email == patient.email) patientRank = i + 1;
  }

  return res.render("patientHome", {
    title: "Home",
    style1: "patientAll.css",
    style2: "patientHome.css",
    style3: theme + ".css",
    glucoseData: glucoseData,
    insulinData: insulinData,
    weightData: weightData,
    stepData: stepData,
    engagement_rate: updatePatientRecord.engagement_rate.toFixed(1),
    over_80: over_80,
    leaderboard: leaderboard,
    patientRank: patientRank,
    supportMessage: patient.supportMessage,
  });
};

//insert data at record data page
const insertData = async (req, res) => {
  var patient_email = req.session.patient_email;
  const patient = await Patient.findOne({ email: patient_email });
  const clinician_email = patient.clinician_email;
  const glucoseData = req.body.Bloodglucose;
  const insulinData = req.body.Insulin;
  const weightData = req.body.Weight;
  const stepData = req.body.Exercise;
  const BG_comment = req.body.BG_comment;
  const In_comment = req.body.In_comment;
  const We_comment = req.body.We_comment;
  const Ex_comment = req.body.Ex_comment;
  //get date for today
  Today = utility.currentDate();
  if (patient)
    var findDate = await Records.findOne({
      patient_email: patient_email,
      entryDate: Today,
    });
  var filter = {
    patient_email: patient_email,
    entryDate: Today,
  };

  //create a new record collection if the one for today is not created yet
  if (!findDate) {
    var newRecord = new Records({
      PatientID: patient._id,
      patient_email: patient_email,
      clinician_email: clinician_email,
      entryDate: Today,
    });
    await newRecord.save();

    //update whether patient is required to record each data
    const BG_requirement = patient.Bloodglucose.requirement;
    const In_requirement = patient.Insulin.requirement;
    const We_requirement = patient.Weight.requirement;
    const Ex_requirement = patient.Steps.requirement;
    const updateRequirement = await Records.findOneAndUpdate(
      filter,
      {
        $set: {
          "Bloodglucose.requirement": BG_requirement,
          "Insulin.requirement": In_requirement,
          "Weight.requirement": We_requirement,
          "Steps.requirement": Ex_requirement,
        },
      },
      { new: true }
    );
    await updateRequirement.save();

    //update patient's record list
    const updateRecordList = await Patient.findOneAndUpdate(
      { _id: patient.id },
      {
        $push: {
          health_records: newRecord._id,
        },
      },
      { new: true }
    );
    findDate = newRecord;
  }
  var completed = findDate.completed; //find how many data  the patient is recorded already
  
  //if health record collection already exist then add into the existing collection
  //record glucose data
  if (glucoseData) {
    if (glucoseData >= patient.Bloodglucose.upper_value)
      var over_threshold = true;
    else over_threshold = false;
    if (glucoseData <= patient.Bloodglucose.lower_value)
      var under_threshold = true;
    else under_threshold = false;

    completed += 1;
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      {
        $set: {
          completed: completed,
          "Bloodglucose.data": glucoseData,
          "Bloodglucose.entryTime": utility.currentTime(),
          "Bloodglucose.over_threshold": over_threshold,
          "Bloodglucose.under_threshold": under_threshold,
        },
      },
      { new: true }
    );
    await updateRecord
      .save()
      .then(res.render("patient-record-data", { title: "Record Data" }))
      .catch((err) => res.send(err));
  }
  if (BG_comment) {
    const newComment = new Comment({
      data: BG_comment[0],
      entryTime: utility.currentTime(),
    });
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      { $set: { "Bloodglucose.comment": newComment } },
      { new: true }
    );
    await updateRecord
      .save()
      .catch((err) => res.send(err));
  }

  //record insulin Data and comment
  if (insulinData) {
    //check lower and upper threshold
    if (insulinData >= patient.Insulin.upper_value) var over_threshold = true;
    else over_threshold = false;
    if (insulinData <= patient.Insulin.lower_value) var under_threshold = true;
    else under_threshold = false;

    completed += 1;
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      {
        $set: {
          completed: completed,
          "Insulin.data": insulinData,
          "Insulin.entryTime": utility.currentTime(),
          "Insulin.over_threshold": over_threshold,
          "Insulin.under_threshold": under_threshold,
        },
      },
      { new: true }
    );
    await updateRecord
      .save()
      .then(res.render("patient-record-data", { title: "Record Data" }))
      .catch((err) => res.send(err));
  }
  if (In_comment) {
    const newComment = new Comment({
      data: In_comment[0],
      entryTime: utility.currentTime(),
    });
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      { $set: { "Insulin.comment": newComment } },
      { new: true }
    );
    await updateRecord
      .save()
      .catch((err) => res.send(err));
  }
  //record weight data and comment
  if (weightData) {
    if (weightData >= patient.Weight.upper_value) var over_threshold = true;
    else over_threshold = false;
    if (weightData <= patient.Weight.lower_value) var under_threshold = true;
    else under_threshold = false;
    completed += 1;
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      {
        $set: {
          completed: completed,
          "Weight.data": weightData,
          "Weight.entryTime": utility.currentTime(),
          "Weight.over_threshold": over_threshold,
          "Weight.under_threshold": under_threshold,
        },
      },
      { new: true }
    );

    await updateRecord
      .save()
      .then((result) => res.send(result))
      .catch((err) => res.send(err));
  }
  if (We_comment) {
    const newComment = new Comment({
      data: We_comment[0],
      entryTime: utility.currentTime(),
    });
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      { $set: { "Weight.comment": newComment } },
      { new: true }
    );
    await updateRecord
      .save()
      .then(res.render("patient-record-data", { title: "Record Data" }))
      .catch((err) => res.send(err));
  }

  //record Exercise data and comment
  if (stepData) {
    if (stepData >= patient.Steps.upper_value) var over_threshold = true;
    else over_threshold = false;
    if (stepData <= patient.Steps.lower_value) var under_threshold = true;
    else under_threshold = false;

    completed += 1;
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      {
        $set: {
          completed: completed,
          "Steps.data": stepData,
          "Steps.entryTime": utility.currentTime(),
          "Steps.over_threshold": over_threshold,
          "Steps.under_threshold": under_threshold,
        },
      },
      { new: true }
    );
    await updateRecord
      .save()
      .then((result) => res.send(result))
      .catch((err) => res.send(err));
  }
  if (Ex_comment) {
    const newComment = new Comment({
      data: Ex_comment[0],
      entryTime: utility.currentTime(),
    });
    const updateRecord = await Records.findOneAndUpdate(
      filter,
      { $set: { "Steps.comment": newComment } },
      { new: true }
    );
    await updateRecord
      .save()
      .then(res.render("patient-record-data", { title: "Record Data" }))
      .catch((err) => res.send(err));
  }

  const update_patient_info = await Patient.findOne({ email: patient_email });
  //calculate completion rate for today
  var required_num_of_data = 0; //this is used to calculate completion rate each day
  if (update_patient_info.Bloodglucose.requirement) required_num_of_data += 1;
  if (update_patient_info.Insulin.requirement) required_num_of_data += 1;
  if (update_patient_info.Weight.requirement) required_num_of_data += 1;
  if (update_patient_info.Steps.requirement) required_num_of_data += 1;

  var status = (completed / required_num_of_data) * 100; //completion rate each day
  const updateRecord = await Records.findOneAndUpdate(
    filter,
    { $set: { status: status } },
    { new: true }
  );
  await updateRecord.save();
};

//show data on record data page
const recordData = async (req, res, next) => {
  Today = utility.currentDate();
  var patient_email = req.session.patient_email;
  const dataToday = await Records.findOne({
    entryDate: Today,
    patient_email: patient_email,
  });
  const patient = await Patient.findOne({ email: patient_email });
  var theme = patient.theme_colour;
  if (dataToday) {
    if (dataToday.Bloodglucose) {
      var glucoseData = dataToday.Bloodglucose.data;
      if (dataToday.Bloodglucose.comment) {
        var BG_comment = dataToday.Bloodglucose.comment.data;
        var BG_commentTime = dataToday.Bloodglucose.comment.entryTime;
      } else BG_comment = null;
    } else glucoseData = null;

    if (dataToday.Insulin) {
      var insulinData = dataToday.Insulin.data;
      if (dataToday.Insulin.comment) {
        var In_comment = dataToday.Insulin.comment.data;
        var In_commentTime = dataToday.Insulin.comment.entryTime;
      } else In_comment = null;
    } else insulinData = null;

    if (dataToday.Weight) {
      var weightData = dataToday.Weight.data;
      if (dataToday.Weight.comment) {
        var We_comment = dataToday.Weight.comment.data;
        var We_commentTime = dataToday.Weight.comment.entryTime;
      } else We_comment = null;
    } else weightData = null;

    if (dataToday.Steps) {
      var stepData = dataToday.Steps.data;
      if (dataToday.Steps.comment) {
        var Ex_comment = dataToday.Steps.comment.data;
        var Ex_commentTime = dataToday.Steps.comment.entryTime;
      } else Ex_comment = null;
    } else stepData = null;
  }

  return res.render("patient-record-data", {
    title: "Record Data",
    style1: "patientAll.css",
    style2: "patientRecordData.css",
    style3: theme + ".css",
    glucoseData: glucoseData,
    insulinData: insulinData,
    weightData: weightData,
    stepData: stepData,
    BG_comment: BG_comment,
    In_comment: In_comment,
    We_comment: We_comment,
    Ex_comment: Ex_comment,
    BG_commentTime: BG_commentTime,
    In_commentTime: In_commentTime,
    We_commentTime: We_commentTime,
    Ex_commentTime: Ex_commentTime,
    BG_requirement: patient.Bloodglucose.requirement,
    In_requirement: patient.Insulin.requirement,
    We_requirement: patient.Weight.requirement,
    Ex_requirement: patient.Steps.requirement,
  });
};

//view data page
const viewData = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  var getDate = utility.currentDate();
  var weeklyDate = utility.get_weekly_dates(getDate);
  var week = 7;
  const recordList = await Records.find({ patient_email: patient_email })
    .sort({ entryDate: -1 })
    .limit(7)
    .lean();
  const patient = await Patient.findOne({ email: patient_email });
  var date = [];
  var Bloodglucose = [];
  var Insulin = [];
  var Weight = [];
  var Steps = [];
  var theme = patient.theme_colour
  //handle dataset for graph
  for (let i = 0; i < week; i++) {
    date.push(0);
    Bloodglucose.push(0);
    Insulin.push(0);
    Weight.push(0);
    Steps.push(0);
    for (let j = 0; j < recordList.length; j++) {
      if (weeklyDate[i] == recordList[j].entryDate) {
        date.splice(i, 1, recordList[j].entryDate);
        if(recordList[j].Bloodglucose)
        {
          if (recordList[j].Bloodglucose.data)
            Bloodglucose.splice(i, 1, recordList[j].Bloodglucose.data);
        }
        if(recordList[j].Insulin)
        {
          if (recordList[j].Insulin.data)
            Insulin.splice(i, 1, recordList[j].Insulin.data);
        }
        if(recordList[j].Weight)
        {
          if (recordList[j].Weight.data)
            Weight.splice(i, 1, recordList[j].Weight.data);
        }
        if(recordList[j].Steps)
        {
          if (recordList[j].Steps.data)
            Steps.splice(i, 1, recordList[j].Steps.data);
        }
      }
    }
  }

  //handle dataset for overview data in table,
  //if data is not enterted, it's able to show
  //which one is not required and which one is
  //the one that patient didn't enter
  for (let i = 0; i < recordList.length; i++) {
    entryDate = Date.parse(recordList[i].entryDate);
    entryMonth =
      new Date(entryDate).getMonth() + 1 < 10
        ? "0" + (new Date(entryDate).getMonth() + 1)
        : new Date(entryDate).getMonth() + 1;
    entryDay =
      new Date(entryDate).getDate() < 10
        ? "0" + new Date(entryDate).getDate()
        : new Date(entryDate).getDate();
    recordList[i].entryDate = entryDay + "/" + entryMonth;
    if(recordList[i].Bloodglucose)
    {
      if (!recordList[i].Bloodglucose.requirement) 
      recordList[i].Bloodglucose.data = "--";      
    }
    if(recordList[i].Insulin)
    {
      if (!recordList[i].Insulin.requirement)
      recordList[i].Insulin.data = "--";      
    }
    if(recordList[i].Weight)
    {
      if (!recordList[i].Weight.requirement) 
      recordList[i].Weight.data = "--";      
    }
    if(recordList[i].Steps)
    {
      if (!recordList[i].Steps.requirement) 
      recordList[i].Steps.data = "--";
    }
  }
  res.render("patientView", {
    title: "View data",
    style1: "patientAll.css",
    style2: "patientView.css",
    style3: theme + ".css",
    date: JSON.stringify(weeklyDate),
    Bloodglucose: JSON.stringify(Bloodglucose),
    Insulin: JSON.stringify(Insulin),
    Weight: JSON.stringify(Weight),
    Steps: JSON.stringify(Steps),
    recordList: recordList,
  });
};
const apiViewData = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  var weeklyDate = await req.body.Date;
  if (weeklyDate == null) {
    var getDate = utility.currentDate();
    weeklyDate = utility.get_weekly_dates(getDate);
  }
  var week = 7;
  const recordList = await Records.find({
    entryDate: { $in: weeklyDate },
    patient_email: patient_email,
  })
    .sort({ entryDate: 1 })
    .lean();
  var date = [];
  var Bloodglucose = [];
  var Insulin = [];
  var Weight = [];
  var Steps = [];
  for (let i = 0; i < week; i++) {
    date.push(0);
    Bloodglucose.push(0);
    Insulin.push(0);
    Weight.push(0);
    Steps.push(0);
    for (let j = 0; j < recordList.length; j++) {
      if (weeklyDate[i] == recordList[j].entryDate) {
        date.splice(i, 1, recordList[j].entryDate);
        if(recordList[j].Bloodglucose)
        {
          if (recordList[j].Bloodglucose.data)
            Bloodglucose.splice(i, 1, recordList[j].Bloodglucose.data);
        }
        if(recordList[j].Insulin)
        {
          if (recordList[j].Insulin.data)
            Insulin.splice(i, 1, recordList[j].Insulin.data);
        }
        if(recordList[j].Weight)
        {
          if (recordList[j].Weight.data)
            Weight.splice(i, 1, recordList[j].Weight.data);
        }
        if(recordList[j].Steps)
        {
          if (recordList[j].Steps.data)
            Steps.splice(i, 1, recordList[j].Steps.data);
        }
      }
    }
  }
  const dataLlist = {
    date: date,
    Bloodglucose: Bloodglucose,
    Insulin: Insulin,
    Weight: Weight,
    Steps: Steps,
  };
  res.send(dataLlist);
};

//view history page
const viewHistory = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  var entryMonth =
    new Date().getMonth() + 1 < 10
      ? "0" + (new Date().getMonth() + 1)
      : new Date().getMonth() + 1;
  var entryDay =
    new Date().getDate() < 10
      ? "0" + new Date().getDate()
      : new Date().getDate();
  const entryYear = new Date().getFullYear();
  var year_month = entryYear + "-" + entryMonth;
  const recordList = await Records.find({
    patient_email: patient_email,
    $or: [{ entryDate: { $regex: year_month } }],
  })
    .sort({ entryDate: -1 })
    .lean();
  const patient = await Patient.findOne({ email: patient_email });
  var theme = patient.theme_colour;
  for (let i = 0; i < recordList.length; i++) {
    entryDate = Date.parse(recordList[i].entryDate);
    entryMonth = new Date(entryDate).getMonth() + 1 < 10 ? "0" + (new Date(entryDate).getMonth() + 1) : new Date(entryDate).getMonth() + 1;
    entryDay = new Date(entryDate).getDate() < 10 ? "0" + new Date(entryDate).getDate() : new Date(entryDate).getDate();
    recordList[i].entryDate = entryDay + "/" + entryMonth;
    if(recordList[i].Bloodglucose)
    {
      if (!recordList[i].Bloodglucose.requirement) 
      recordList[i].Bloodglucose.data = "--";      
    }
    if(recordList[i].Insulin)
    {
      if (!recordList[i].Insulin.requirement)
      recordList[i].Insulin.data = "--";      
    }
    if(recordList[i].Weight)
    {
      if (!recordList[i].Weight.requirement) 
      recordList[i].Weight.data = "--";      
    }
    if(recordList[i].Steps)
    {
      if (!recordList[i].Steps.requirement) 
      recordList[i].Steps.data = "--";
    }
  }

  res.render("patientHistory", {
    title: "View history",
    style1: "patientAll.css",
    style2: "patientHistory.css",
    style3: theme + ".css",
    recordList: recordList,
  });
};
const apiHistory = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  var getDate = req.body.Date;
  var recordList = await Records.find({
    patient_email: patient_email,
    $or: [{ entryDate: { $regex: getDate } }],
  })
    .sort({ entryDate: -1 })
    .lean();
  if (recordList[0] == null) recordList = null;
  return res.send(recordList);
};
const profile = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  const patient = await Patient.findOne({ email: patient_email });
  const given_name = patient.given_name;
  const family_name = patient.family_name;
  const screen_name = patient.screen_name;
  const user_id = patient.email;
  const birth_year = patient.year_of_birth;
  const bio = patient.bio;
  var theme = patient.theme_colour;

  res.render("patientProfile", {
    title: "Profile",
    given_name : given_name,
    family_name: family_name,
    screen_name: screen_name,
    user_id: user_id,
    birth_year: birth_year,
    bio: bio,
    style1: "patientAll.css",
    style2: "patientProfile.css",
    style3: theme + ".css",
  });
}
const accesseditProfile = async (req, res) => {
  var patient_email = req.session.patient_email;
  const patient = await Patient.findOne({ email: patient_email });
  const given_name = patient.given_name;
  const family_name = patient.family_name;
  const screen_name = patient.screen_name;
  const user_id = patient.email;
  const birth_year = patient.year_of_birth;
  const bio = patient.bio;
  var theme = patient.theme_colour;

  res.render("profileEditProfile", {
    title: "Edit Profile",
    given_name : given_name,
    family_name: family_name,
    screen_name: screen_name,
    user_id: user_id,
    birth_year: birth_year,
    bio: bio,
    style1: "patientAll.css",
    style2: "patientProfile.css",
    style3: theme + ".css",
  })
}
const editProfile = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  const patient = await Patient.findOne({ email: patient_email });
  var new_screenname = req.body.newscreenname;
  var new_bio = req.body.newbio;

  const updateProfile = await Patient.findOneAndUpdate(
    {
      email: patient_email
    },
    {
      screen_name: new_screenname,
      bio: new_bio,
    },
    { new: true }
  );
  await updateProfile.save();
  return res.redirect("/patient/profile");
}
const resetPassword = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  const patient = await Patient.findOne({ email: patient_email });
  var theme = patient.theme_colour;
  res.render("patientResetPassword", {
    title: "Reset Password",
    style1: "patientAll.css",
    style2: "patientResetPassword.css",
    style3: theme + ".css",
  });
}
const changePassword = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      email: req.session.patient_email,
    }).lean();
    var theme = patient.theme_colour;
    if (req.body.newpsw.length < 8) {
      // check password whether less than 8 characters
      return res.render("patientResetPassword", {
        title: "Reset Password",
        style1: "patientAll.css",
        style2: "patientResetPassword.css",
        style3: theme + ".css",
        r_error2: true,
      });
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(req.body.newpsw)) {
      // Password does not match requirement
      return res.render("patientResetPassword", {
        title: "Reset Password",
        style1: "patientAll.css",
        style2: "patientResetPassword.css",
        style3: theme + ".css",
        r_error3: true,
      });
    } else if (req.body.newpsw != req.body.confirmpsw) {
      // Password does not match
      return res.render("patientResetPassword", {
        title: "Reset Password",
        style1: "patientAll.css",
        style2: "patientResetPassword.css",
        style3: theme + ".css",
        r_error4: true,
      });
    } else if (
      await bcrypt.compare(req.body.oldpsw.toString(), patient.password)
    ) {
      // if password is validated, change the new_password for user
      const new_password = await bcrypt.hash(req.body.newpsw, 10);
      await Patient.findOneAndUpdate(
        {
          email: req.session.patient_email,
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
      return res.render("patientResetPassword", {
        title: "Reset Password",
        style1: "patientAll.css",
        style2: "patientResetPassword.css",
        style3: theme + ".css",
        old_error: true,
      });
    }
  } catch (err) {
    res.status(400);
    console.log(err);
    return res.send(err);
  }
};
const theme = async (req, res, next) => {
  var patient_email = req.session.patient_email;
  const patient = await Patient.findOne({ email: patient_email });
  var theme = patient.theme_colour;
  res.render("patientTheme", {
    style1: "patientAll.css",
    style2: "patientTheme.css",
    style3: theme + ".css",
  })
}
const changeTheme =  async (req, res, next) => {
  const theme = await req.body.theme
  const updateTheme = await Patient.findOneAndUpdate(
    { 
      email: req.session.patient_email
    },
    {
      theme_colour: theme
    },

  );
  await updateTheme.save()
    .then(res.render("patientTheme", { 
      title: "Theme",
      style1: "patientAll.css",
      style2: "patientTheme.css",
      style3: theme + ".css",
    }))
    .catch((err) => res.send(err));
}
module.exports = {
  aboutDiabetes,
  aboutThisWebsite,
  accessLogin,
  handleLogout,
  homePage,
  recordData,
  insertData,
  handleLogin,
  viewData,
  viewHistory,
  apiHistory,
  apiViewData,
  profile,
  accesseditProfile,
  editProfile,
  resetPassword,
  changePassword,
  theme,
  changeTheme,
};
