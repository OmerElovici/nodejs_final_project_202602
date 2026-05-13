const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Establishes a connection to the MongoDB database.
 * Uses the MONGODB_URI environment variable or a local fallback.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cost-manager';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected! Exiting process...');
      process.exit(1);
    });
  } catch (connectionError) {
    console.error('MongoDB connection error:', connectionError);
    process.exit(1);
  }
};

module.exports = connectDB;
