// package
const mongoose = require("mongoose");
const db_secret = require("./db_secret.json");
// URI
const uri = db_secret.mongodb_uri;

// Connect MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log("MongoDB Connected...");
  } catch (error) {
    console.error('Mongo DB connect ERROR',err);
    process.exit(1);
  }
};

module.exports = connectDB;