const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/user');
const Cost = require('./models/cost');
const Log = require('./models/log');
const Report = require('./models/report');

/**
 * Seeds the database with initial data for development and testing.
 * Clears existing data and adds the mandatory default user.
 * @async
 * @function seedDatabase
 * @returns {Promise<void>}
 */
const seedDatabase = async () => {
  await connectDB();
  
  await User.deleteMany({});
  await Cost.deleteMany({});
  await Log.deleteMany({});
  await Report.deleteMany({});
  
  const defaultUser = new User({
    id: 123123,
    firstName: 'mosh',
    lastName: 'israeli',
    birthday: new Date('1990-01-01')
  });
  
  await defaultUser.save();
  
  console.log('Database seeded successfully.');
  
  process.exit(0);
};

seedDatabase();
