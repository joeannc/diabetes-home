var register = function (Handlebars) {
  var helpers = {
    displaydata: function (value, upper, lower) {
      if (value > upper || value < lower) {
          console.log(value)
        return new Handlebars.SafeString(
          "<td id=\"highlighted\">" + value + "</td>"
        );
      } else {
        return new Handlebars.SafeString("<td>" + value + "</td>");
      }
    },
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    // register helpers
    for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    // just return helpers object if we can't register helpers here
    return helpers;
  }
};

// export helpers to be used in our express app
module.exports.register = register;
module.exports.helpers = register(null);
