require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    
    // Update existing user or create new one
    let admin = await User.findOne({ ucid: "TARA-ADMIN" });
    if (!admin) {
      admin = new User({
        ucid: "TARA-ADMIN",
        nama: "Admin Utama",
        blok: "HQ-01",
        role: "ADMINISTRATOR",
        qrToken: "admin_secret_token_2025",
        isActivated: false
      });
      await admin.save();
      console.log("Admin user created: TARA-ADMIN");
    } else {
      admin.role = "ADMINISTRATOR";
      await admin.save();
      console.log("Admin user updated: TARA-ADMIN");
    }

    // Also update Farell to ADMIN if he exists
    const farell = await User.findOne({ nama: "Farell" });
    if (farell) {
      farell.role = "ADMINISTRATOR";
      await farell.save();
      console.log("User Farell updated to ADMINISTRATOR");
    }

    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
};

seedAdmin();
