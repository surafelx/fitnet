
// db.js
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        connectTimeoutMS: 30000,  // Increase timeout duration
        socketTimeoutMS: 30000,   // Increase socket timeout
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1); // Exit the process if MongoDB connection fails
    }
  };
  
module.exports = connectDB;
