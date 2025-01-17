const mongoose = require("mongoose");
const mongodbUrl = process.env.MONGODB_URI;

mongoose
  .connect(mongodbUrl)
  .then(() => {})
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB Connected!");
});
