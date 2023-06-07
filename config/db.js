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

// fitbit 액세스 토큰 모델 정의
// const accessTokenSchema = new mongoose.Schema({
//   token:String
// });

// const AccessToken = mongoose.model('AccessToken', accessTokenSchema);


// const saveAccessToken = (accessToken) => {
//   const newAccessToken = new AccessToken({ token: accessToken });
//   return newAccessToken.save();
// };

module.exports = connectDB;
//module.exports = { connectDB, saveAccessToken, AccessToken };