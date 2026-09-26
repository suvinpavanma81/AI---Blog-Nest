const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    console.error('MongoDB connection error: MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('authentication failed')) {
      console.error('MongoDB authentication failed. Check the Atlas database username, password, and encoded special characters in MONGO_URI.');
    } else {
      console.error(`MongoDB connection error: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
