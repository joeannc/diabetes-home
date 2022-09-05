if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
};
const mongoose = require("mongoose");

// If the app is running in heroku
if (process.env.PORT) {
  // are we running on Heroku?
  // login details retrieved from environment variables
  connectionString =
    // "mongodb+srv://<username>:<password>@web.6wemj.mongodb.net/INFO30005?retryWrites=true&w=majority";
    "mongodb+srv://<username>:<password>@web.yawzm.mongodb.net/INFO30005?retryWrites=true&w=majority";

  dbAddress = connectionString
    .replace("<username>", process.env.MONGO_USERNAME)
    .replace("<password>", process.env.MONGO_PASSWORD);
} else {
  // running locally
  dbAddress = "mongodb://localhost";
}

dbAddress =
  // "mongodb+srv://pikapika:lEJwdkRCCkNBxcy6@web.6wemj.mongodb.net/INFO30005?retryWrites=true&w=majority";
  "mongodb+srv://pikapika:JZPmTPVYMC3kWDsQ@web.yawzm.mongodb.net/INFO30005?retryWrites=true&w=majority";

// connect to mongodb database
mongoose.connect(dbAddress, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "INFO30005",
});

// connect to database
const db = mongoose.connection;

db.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

// Log to console once the database is open
db.once("open", async () => {
  console.log(`Mongo Connection started on ${db.host}:${db.port}`);
});

// Obtain the database schema
require("./clinicianSchema");
require("./recordSchema");
