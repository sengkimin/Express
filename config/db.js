require('dotenv').config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

const conDB = async () => {
  try {
    const connectDB = await mongoose.connect(url);
    console.log("Connected to the database");
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

module.exports = conDB;
