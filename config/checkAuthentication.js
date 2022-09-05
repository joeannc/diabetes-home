module.exports = {
  ensurePatientAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      if (req.params.patient_email) {
        if (req.user.email == req.params.patient_email) {
          return next();
        } else {
          return res.render("redirect-page-patient", {
            error_message:
              "Access denied, this page will redirect to login page in 3s.",
          });
        }
      }
      return next();
    }
    return res.render("redirect-page-patient", {
      error_message:
        "Please log in to get access, this page will redirect to login page in 3s.",
    });
  },

  ensureClinicianAuthenticated: function (req, res, next) {
    // check whether the clinician has permission to access
    if (req.isAuthenticated()) {
      if (req.params.clinician_email) {
        if (req.user.email == req.params.clinician_email) {
          return next();
        } else {
          return res.render("redirect-page-clinician", {
            error_message:
              "Access denied, this page will redirect to login page in 3s.",
          });
        }
      }
      return next();
    }
    return res.render("redirect-page-clinician", {
      error_message:
        "Please log in to get access, this page will redirect to login page in 3s.",
    });
  },
};
