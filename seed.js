const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/user');
const Cost = require('./models/cost');
const Log = require('./models/log');
const Report = require('./models/report');

const seedDB = async () => {
  await connectDB();
  
  // Clear all collections
  await User.deleteMany({});
  await Cost.deleteMany({});
  await Log.deleteMany({});
  await Report.deleteMany({});
  
  // Add the required user and some additional users
  const users = [
    {
      id: 123123,
      first_name: 'mosh',
      last_name: 'israeli',
      birthday: new Date('1990-01-01')
    },
    {
      id: 111222,
      first_name: 'john',
      last_name: 'doe',
      birthday: new Date('1985-05-15')
    },
    {
      id: 333444,
      first_name: 'jane',
      last_name: 'smith',
      birthday: new Date('1992-10-20')
    }
  ];
  
  await User.insertMany(users);

  // Add some costs for the users
  const costs = [
    // Costs for mosh israeli (123123)
    {
      userid: 123123,
      description: 'milk',
      category: 'food',
      sum: 8,
      createdAt: new Date('2026-01-15T10:00:00Z')
    },
    {
      userid: 123123,
      description: 'bread',
      category: 'food',
      sum: 12,
      createdAt: new Date('2026-01-18T10:00:00Z')
    },
    {
      userid: 123123,
      description: 'vitamins',
      category: 'health',
      sum: 45,
      createdAt: new Date('2026-01-20T10:00:00Z')
    },
    {
      userid: 123123,
      description: 'rent',
      category: 'housing',
      sum: 1200,
      createdAt: new Date('2026-01-01T10:00:00Z')
    },
    // Costs for john doe (111222)
    {
      userid: 111222,
      description: 'gym membership',
      category: 'sports',
      sum: 50,
      createdAt: new Date('2026-01-05T10:00:00Z')
    },
    {
      userid: 111222,
      description: 'javascript book',
      category: 'education',
      sum: 35,
      createdAt: new Date('2026-01-12T10:00:00Z')
    },
    // Costs for jane smith (333444)
    {
      userid: 333444,
      description: 'apples',
      category: 'food',
      sum: 15,
      createdAt: new Date('2026-01-22T10:00:00Z')
    }
  ];

  await Cost.insertMany(costs);
  
  console.log('Database seeded successfully with multiple users and costs');
  process.exit(0);
};

seedDB();
