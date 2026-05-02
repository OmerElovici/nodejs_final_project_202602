const mongoose = require('mongoose');
require('dotenv').config();

/*
 * Connects to the MongoDB database using the URI from the environment variables.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cost-manager';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected! Exiting process...');
      process.exit(1);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
