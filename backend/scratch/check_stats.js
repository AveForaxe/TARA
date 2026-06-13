require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Report = require("../models/Report");
const Event = require("../models/Event");
const Finance = require("../models/Finance");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  
  const totalWarga = await User.countDocuments();
  const totalLaporan = await Report.countDocuments();
  const eventMendatang = await Event.countDocuments({ status: "Mendatang" });
  
  console.log({
    totalWarga,
    totalLaporan,
    eventMendatang
  });
  process.exit();
}

check();
