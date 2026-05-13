const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');
const User = require('./models/user');
const Cost = require('./models/cost');

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/**
 * POST /api/add
 * Adds a new user to the system.
 * @name add-user
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.post('/api/add', async (request, response) => {
  try {
    const { id, firstName, lastName, birthday } = request.body;
    
    const newUser = new User({ id, firstName, lastName, birthday });
    await newUser.save();
    
    response.json(newUser);
  } catch (serviceError) {
    response.status(400).json({ id: 'error', message: serviceError.message });
  }
});

/**
 * GET /api/users/:id
 * Retrieves details of a specific user and calculates their total costs.
 * @name get-user-details
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/users/:id', async (request, response) => {
  try {
    const userId = Number(request.params.id);
    const userRecord = await User.findOne({ id: userId });
    
    if (!userRecord) {
      return response.status(404).json({ id: 'error', message: 'User not found' });
    }
    
    const userCosts = await Cost.find({ userId: userId });
    const totalSpent = userCosts.reduce((total, currentCost) => total + currentCost.sum, 0);
    
    response.json({
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      id: userRecord.id,
      total: totalSpent
    });
  } catch (serviceError) {
    response.status(500).json({ id: 'error', message: serviceError.message });
  }
});

/**
 * GET /api/users
 * Returns a list of all registered users.
 * @name list-users
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/users', async (request, response) => {
  try {
    const allUsers = await User.find({});
    
    response.json(allUsers);
  } catch (serviceError) {
    response.status(500).json({ id: 'error', message: serviceError.message });
  }
});

const PORT = process.env.USERS_PORT || 3002;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Users service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
