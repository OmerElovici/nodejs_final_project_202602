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
/**
 * Normalizes request body keys for user creation, supporting camelCase, kebab-case, snake_case, lowercase, and uppercase.
 * @param {Object} body - The raw request body.
 * @returns {Object} The normalized body.
 */
const normalizeUserBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const normalized = {};
  for (const key of Object.keys(body)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (lowerKey === 'id' || lowerKey === 'userid') {
      normalized.id = body[key];
    } else if (lowerKey === 'firstname' || lowerKey === 'first') {
      normalized.firstName = body[key];
    } else if (lowerKey === 'lastname' || lowerKey === 'last') {
      normalized.lastName = body[key];
    } else if (lowerKey === 'birthday' || lowerKey === 'birthdate' || lowerKey === 'birth') {
      normalized.birthday = body[key];
    } else {
      normalized[key] = body[key];
    }
  }
  return normalized;
};

app.post('/api/add', async (request, response) => {
  try {
    // Start of request body normalization.
    const normalizedBody = normalizeUserBody(request.body);
    // Destructuring fields from the normalized body.
    const { id, firstName, lastName, birthday } = normalizedBody;
    
    // Check if user ID is missing.
    if (id === undefined || id === null || id === '') {
      // Return specific error for missing user ID.
      return response.status(400).json({ id: 'error', message: 'id is required' });
    }
    
    // Try parsing ID to a numeric value.
    const numericId = typeof id === 'string' ? Number(id) : id;
    // Check if ID is not a valid number.
    if (typeof numericId !== 'number' || isNaN(numericId)) {
      // Return specific error for invalid ID type.
      return response.status(400).json({ id: 'error', message: 'id must be a number' });
    }
    
    // Check if ID is non-positive.
    if (numericId <= 0) {
      // Return specific error for non-positive ID.
      return response.status(400).json({ id: 'error', message: 'id must be a positive number' });
    }
    
    // Validate if firstName is missing.
    if (firstName === undefined || firstName === null || firstName === '') {
      // Return specific error for missing first name.
      return response.status(400).json({ id: 'error', message: 'firstName is required' });
    }
    
    // Validate if firstName is not a string.
    if (typeof firstName !== 'string') {
      // Return specific error for invalid first name type.
      return response.status(400).json({ id: 'error', message: 'firstName must be a string' });
    }
    
    // Validate if lastName is missing.
    if (lastName === undefined || lastName === null || lastName === '') {
      // Return specific error for missing last name.
      return response.status(400).json({ id: 'error', message: 'lastName is required' });
    }
    
    // Validate if lastName is not a string.
    if (typeof lastName !== 'string') {
      // Return specific error for invalid last name type.
      return response.status(400).json({ id: 'error', message: 'lastName must be a string' });
    }
    
    // Validate if birthday is missing.
    if (birthday === undefined || birthday === null || birthday === '') {
      // Return specific error for missing birthday.
      return response.status(400).json({ id: 'error', message: 'birthday is required' });
    }
    
    // Try parsing birthday as Date.
    const parsedBirthday = new Date(birthday);
    // Check if date conversion fails.
    if (isNaN(parsedBirthday.getTime())) {
      // Return specific error for invalid birthday format.
      return response.status(400).json({ id: 'error', message: 'birthday must be a valid date' });
    }
    
    // Check if a user with this ID already exists.
    const existingUser = await User.findOne({ id: numericId });
    // If user exists, reject registration.
    if (existingUser) {
      // Return duplicate user ID error message.
      return response.status(400).json({ id: 'error', message: 'User ID already exists' });
    }
    
    // Create new User instance with validated data.
    const newUser = new User({ id: numericId, firstName, lastName, birthday: parsedBirthday });
    // Persist new user in MongoDB database.
    await newUser.save();
    
    // Send back the created user details.
    response.json(newUser);
  } catch (serviceError) {
    // Capture unexpected errors and report.
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
    // Convert request parameter ID to numeric value.
    const userId = Number(request.params.id);
    // Check if converted user ID is NaN.
    if (isNaN(userId)) {
      // Return error for invalid parameter ID type.
      return response.status(400).json({ id: 'error', message: 'User ID must be a number' });
    }
    
    // Query database for matching user.
    const userRecord = await User.findOne({ id: userId });
    
    // Check if user record was found.
    if (!userRecord) {
      // Return 404 with specific error message.
      return response.status(404).json({ id: 'error', message: 'User not found' });
    }
    
    // Fetch all cost transactions for the user.
    const userCosts = await Cost.find({ userId: userId });
    // Aggregate sum of all user purchases.
    const totalSpent = userCosts.reduce((total, currentCost) => total + currentCost.sum, 0);
    
    // Respond with user profile and total spend.
    response.json({
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      id: userRecord.id,
      total: totalSpent
    });
  } catch (serviceError) {
    // Send 500 error in case of DB failures.
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
