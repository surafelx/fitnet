const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./db");
require("dotenv").config();
const FastSpeedtest = require("fast-speedtest-api");
const app = express();
app.use(cors());
app.use(express.json());

const UserSchema = new mongoose.Schema({
    sessionID: { type: String, unique: true, required: true },
    ip: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, required: true },
    time: { type: Date, default: Date.now },
  });
  
    const User = mongoose.model("User", UserSchema);
// Connect to MongoDB
connectDB();


app.post("/save-location", async (req, res) => {
  try {
    const { sessionID, ip, lat, lng, speed} = req.body;

    // Validate required fields
    if (!sessionID || !ip || !lat || !lng) {
      return res
        .status(400)
        .json({ message: "sessionID, ip, lat, and lng are required" });
    }

    // Test the speed
    
    // Check if a user with the same sessionID exists
    const existingUser = await User.findOne({ sessionID });

    if (existingUser) {
      // If user exists, update their data (lat, lng, time, speed)
      existingUser.lat = lat;
      existingUser.lng = lng;
      existingUser.time = new Date().toISOString();
      existingUser.speed = speed;

      await existingUser.save();
      return res
        .status(200)
        .json({ message: "User location updated successfully", speed });
    }

    // If the user does not exist, create a new user
    const newUser = new User({
      sessionID,
      ip,
      lat,
      lng,
      speed,
      time: new Date().toISOString(),
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User location saved successfully", speed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving or updating user location" });
  }
});

// Fetch User Data API
app.get("/get-locations", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
