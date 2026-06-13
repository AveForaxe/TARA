require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const path = require("path");
const User = require("../models/User");

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    const count = await User.countDocuments();
    console.log("Total Users in DB:", count);
    const users = await User.find().limit(5);
    console.log("First 5 users:", JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
};

checkDB();
