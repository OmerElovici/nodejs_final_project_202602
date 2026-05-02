const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/user');
const Cost = require('./models/cost');
const Log = require('./models/log');
const Report = require('./models/report');

const prepareSubmission = async () => {
  await connectDB();
  
  // Clear all collections
  await User.deleteMany({});
  await Cost.deleteMany({});
  await Log.deleteMany({});
  await Report.deleteMany({});
  
  // Add ONLY the single required imaginary user
  const user = new User({
    id: 123123,
    first_name: 'mosh',
    last_name: 'israeli',
    birthday: new Date('1990-01-01')
  });
  
  await user.save();
  
  console.log('Database prepared for submission. All data cleared except for the required user (123123).');
  process.exit(0);
};

prepareSubmission();
