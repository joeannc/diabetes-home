//patient personal's detail
const mongoose = require("mongoose");
const { Double } = require("bson");
const utility = require("../js/utility.js");
const { type } = require("express/lib/response");

const clinicalNotesSchema = new mongoose.Schema({
  data: { type: String },
  entryDate: { type: String, default: utility.currentDate() },
  entryTime: { type: String, default: utility.currentTime() },
});

const propertySchema = new mongoose.Schema({
  requirement: { type: Boolean, default: true },
  upper_value: { type: Number },
  lower_value: { type: Number },
});
const supportMessageSchema = new mongoose.Schema({
  data: { type: String },
  entryDate: { type: String, default: utility.currentDate() },
  entryTime: { type: String, default: utility.currentTime() },
});

const patientSchema = new mongoose.Schema({
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
  clinician_email: {
    type: String,
    required: true,
    // default: ,
  },
  register_date: {
    type: String,
    default: utility.currentDate(),
  },
  time: {
    type: String,
    default: utility.currentTime(),
  },
  password: {
    type: String,
    required: true,
  },
  theme_colour: {
    type: String,
  },
  Bloodglucose: propertySchema,
  Weight: propertySchema,
  Insulin: propertySchema,
  Steps: propertySchema,
  clinical_notes: [clinicalNotesSchema],
  health_records: [{ type: mongoose.Schema.Types.ObjectId, ref: "Records" }],
  num_require: { type: Number },
  engagement_rate: { type: Number },
  supportMessage: supportMessageSchema,
});



const commentSchema = new mongoose.Schema({
  data: { type: String, required: true },
  entryTime: { type: String, default: utility.currentTime() },
});

//patient's health records
const bloodglucoseSchema = new mongoose.Schema({
  data: { type: Number },
  over_threshold: { type: Boolean },
  under_threshold: { type: Boolean },
  comment: commentSchema,
  requirement: { type: Boolean },
  entryTime: { type: String, default: utility.currentTime() },
});

const insulinSchema = new mongoose.Schema({
  data: { type: Number },
  over_threshold: { type: Boolean },
  under_threshold: { type: Boolean },
  comment: commentSchema,
  requirement: { type: Boolean },
  entryTime: { type: String, default: utility.currentTime() },
});

const weightSchema = new mongoose.Schema({
  data: { type: Number },
  over_threshold: { type: Boolean },
  under_threshold: { type: Boolean },
  comment: commentSchema,
  requirement: { type: Boolean },
  entryTime: { type: String, default: utility.currentTime() },
});

const stepsSchema = new mongoose.Schema({
  data: { type: Number },
  over_threshold: { type: Boolean },
  under_threshold: { type: Boolean },
  comment: commentSchema,
  requirement: { type: Boolean },
  entryTime: { type: String, default: utility.currentTime() },
});

const healthSchema = new mongoose.Schema({
  // given_name: { type: String },
  // family_name: { type: String },
  patient_email: { type: String },
  // PatientID: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  clinician_email: { type: String },
  entryDate: { type: String, default: utility.currentDate() },
  Bloodglucose: bloodglucoseSchema,
  Insulin: insulinSchema,
  Weight: weightSchema,
  Steps: stepsSchema,
  PatientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patients",
  },
  completed: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
});

const Patient = mongoose.model("Patients", patientSchema);
const Records = mongoose.model("Records", healthSchema);
const Comment = mongoose.model("Comment", commentSchema);
const BloodGlucoseLevel = mongoose.model("BloodGlucoseLevel",bloodglucoseSchema);
const Insulindose = mongoose.model("Insulindose", insulinSchema);
const Weight = mongoose.model("Weight", weightSchema);
const Steps = mongoose.model("Steps", stepsSchema);

module.exports = {
  Patient,
  Records,
  Comment,
  BloodGlucoseLevel,
  Insulindose,
  Weight,
  Steps,
};

