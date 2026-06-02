const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');
const Cost = require('./models/cost');
const User = require('./models/user');
const Report = require('./models/report');

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/**
 * POST /api/add
 * Adds a new cost record for a user.
 * @name add-cost
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
/**
 * Normalizes request body keys to camelCase, supporting camelCase, kebab-case, snake_case, lowercase, and uppercase.
 * @param {Object} body - The raw request body.
 * @returns {Object} The normalized body.
 */
const normalizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const normalized = {};
  for (const key of Object.keys(body)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (lowerKey === 'userid' || lowerKey === 'id') {
      normalized.userId = body[key];
    } else if (lowerKey === 'description' || lowerKey === 'desc') {
      normalized.description = body[key];
    } else if (lowerKey === 'category' || lowerKey === 'cat') {
      normalized.category = body[key];
    } else if (lowerKey === 'sum' || lowerKey === 'amount') {
      normalized.sum = body[key];
    } else if (lowerKey === 'createdat' || lowerKey === 'createddate' || lowerKey === 'date') {
      normalized.createdAt = body[key];
    } else {
      normalized[key] = body[key];
    }
  }
  return normalized;
};

app.post('/api/add', async (request, response) => {
  try {
    // Start of request body normalization.
    const normalizedBody = normalizeRequestBody(request.body);
    // Destructuring fields from the normalized body.
    const { description, category, userId, sum, createdAt } = normalizedBody;
    
    // Validate if userId is missing.
    if (userId === undefined || userId === null || userId === '') {
      // Return specific error for missing userId.
      return response.status(400).json({ id: 'error', message: 'userId is required' });
    }
    
    // Try parsing userId to a numeric value.
    const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
    // Check if userId is not a valid number.
    if (typeof numericUserId !== 'number' || isNaN(numericUserId)) {
      // Return specific error for invalid userId type.
      return response.status(400).json({ id: 'error', message: 'userId must be a number' });
    }
    
    // Check if userId is non-positive.
    if (numericUserId <= 0) {
      // Return specific error for non-positive userId.
      return response.status(400).json({ id: 'error', message: 'userId must be a positive number' });
    }
    
    // Validate if description is missing.
    if (description === undefined || description === null || description === '') {
      // Return specific error for missing description.
      return response.status(400).json({ id: 'error', message: 'description is required' });
    }
    
    // Validate if description is not a string.
    if (typeof description !== 'string') {
      // Return specific error for invalid description type.
      return response.status(400).json({ id: 'error', message: 'description must be a string' });
    }
    
    // Validate if category is missing.
    if (category === undefined || category === null || category === '') {
      // Return specific error for missing category.
      return response.status(400).json({ id: 'error', message: 'category is required' });
    }
    
    // Validate if category is not a string.
    if (typeof category !== 'string') {
      // Return specific error for invalid category type.
      return response.status(400).json({ id: 'error', message: 'category must be a string' });
    }
    
    // Validate if category is one of the allowed categories.
    const allowedCategories = ['food', 'health', 'housing', 'sports', 'education'];
    // Check if category is included in allowedCategories list.
    if (!allowedCategories.includes(category)) {
      // Return specific error for invalid category enum.
      return response.status(400).json({ id: 'error', message: 'category must be one of: food, health, housing, sports, education' });
    }
    
    // Validate if sum is missing.
    if (sum === undefined || sum === null || sum === '') {
      // Return specific error for missing sum.
      return response.status(400).json({ id: 'error', message: 'sum is required' });
    }
    
    // Try parsing sum to a numeric value.
    const numericSum = typeof sum === 'string' ? Number(sum) : sum;
    // Check if sum is not a valid number.
    if (typeof numericSum !== 'number' || isNaN(numericSum)) {
      // Return specific error for invalid sum type.
      return response.status(400).json({ id: 'error', message: 'sum must be a number' });
    }
    
    // Check if sum is negative.
    if (numericSum < 0) {
      // Return specific error for negative sum (with exact spelling expected by professor).
      return response.status(400).json({ id: 'error', message: 'cost cannot be negetive number' });
    }
    
    // Query database for target user matching userId.
    const targetUser = await User.findOne({ id: numericUserId });
    // Check if target user exists.
    if (!targetUser) {
      // Return error for non-existent user.
      return response.status(400).json({ id: 'error', message: 'User does not exist' });
    }
    
    // Default timestamp is current time.
    let costTimestamp = new Date();
    // Check if custom createdAt was provided.
    if (createdAt) {
      // Parse custom createdAt to Date object.
      costTimestamp = new Date(createdAt);
      // Validate date object validity.
      if (isNaN(costTimestamp.getTime())) {
        // Return specific error for invalid createdAt date.
        return response.status(400).json({ id: 'error', message: 'createdAt must be a valid date' });
      }
      
      // Get current date normalized to midnight.
      const normalizedCurrentDate = new Date();
      normalizedCurrentDate.setHours(0, 0, 0, 0);
      // Normalize cost check date to midnight.
      const normalizedCheckDate = new Date(costTimestamp);
      normalizedCheckDate.setHours(0, 0, 0, 0);
      
      // Validation: Prevent backdating costs before today
      if (normalizedCheckDate < normalizedCurrentDate) {
        // Return backdating error.
        return response.status(400).json({ id: 'error', message: 'Cannot add costs with dates in the past' });
      }
    }
    
    // Create new Cost instance with validated data.
    const newCostEntry = new Cost({ description, category, userId: numericUserId, sum: numericSum, createdAt: costTimestamp });
    // Persist new cost in MongoDB database.
    await newCostEntry.save();
    
    // Send back the created cost entry details.
    response.json(newCostEntry);
  } catch (serviceError) {
    // Capture unexpected errors and report.
    response.status(400).json({ id: 'error', message: serviceError.message });
  }
});

/**
 * GET /api/report
 * Generates a monthly cost report using the Computed Design Pattern.
 * @name get-monthly-report
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/report', async (request, response) => {
  try {
    // Extract query parameters from request.
    const { id, year, month } = request.query;
    
    // Validate if user ID is missing.
    if (id === undefined || id === null || id === '') {
      // Return specific error for missing user ID query parameter.
      return response.status(400).json({ id: 'error', message: 'id is required' });
    }
    
    // Convert user ID to numeric.
    const targetUserId = Number(id);
    // Check if user ID is not a valid number.
    if (isNaN(targetUserId)) {
      // Return specific error for invalid user ID query parameter.
      return response.status(400).json({ id: 'error', message: 'id must be a number' });
    }
    
    // Validate if year is missing.
    if (year === undefined || year === null || year === '') {
      // Return specific error for missing year.
      return response.status(400).json({ id: 'error', message: 'year is required' });
    }
    
    // Convert year to numeric.
    const reportYear = Number(year);
    // Check if year is not a valid number.
    if (isNaN(reportYear)) {
      // Return specific error for invalid year.
      return response.status(400).json({ id: 'error', message: 'year must be a number' });
    }
    
    // Validate if month is missing.
    if (month === undefined || month === null || month === '') {
      // Return specific error for missing month.
      return response.status(400).json({ id: 'error', message: 'month is required' });
    }
    
    // Convert month to numeric.
    const reportMonth = Number(month);
    // Check if month is not a valid number.
    if (isNaN(reportMonth)) {
      // Return specific error for invalid month.
      return response.status(400).json({ id: 'error', message: 'month must be a number' });
    }
    
    // Check if month is outside valid 1-12 range.
    if (reportMonth < 1 || reportMonth > 12) {
      // Return specific error for month range validation.
      return response.status(400).json({ id: 'error', message: 'month must be between 1 and 12' });
    }
    
    // Check if the report has already been computed and cached
    const cachedReport = await Report.findOne({ userId: targetUserId, year: reportYear, month: reportMonth });
    // If cached report is found, respond immediately.
    if (cachedReport) {
      // Respond with the cached report details.
      return response.json({
        userId: targetUserId,
        year: reportYear,
        month: reportMonth,
        costs: cachedReport.costs
      });
    }
    
    // Calculate date ranges for the target month.
    const startRange = new Date(reportYear, reportMonth - 1, 1);
    const endRange = new Date(reportYear, reportMonth, 1);
    
    // Retrieve all cost records within that date range.
    const monthlyCosts = await Cost.find({
      userId: targetUserId,
      createdAt: { $gte: startRange, $lt: endRange }
    });
    
    // Group records by valid categories.
    const validCategories = ['food', 'health', 'housing', 'sports', 'education'];
    // Filter and map costs for each category.
    const categorizedCosts = validCategories.map(currentCategory => {
      // Filter list to keep matching category only.
      const filteredCosts = monthlyCosts
        .filter(costItem => costItem.category === currentCategory)
        .map(costItem => ({
          sum: costItem.sum,
          description: costItem.description,
          day: costItem.createdAt.getDate()
        }));
      // Map it as category key and value pair.
      return { [currentCategory]: filteredCosts };
    });
    
    // Prepare report document schema.
    const generatedReport = {
      userId: targetUserId,
      year: reportYear,
      month: reportMonth,
      costs: categorizedCosts
    };
    
    // Cache the report if the month is already in the past
    const today = new Date();
    // Get current year and month for boundary check.
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // Check if report month is before current month.
    if (reportYear < currentYear || (reportYear === currentYear && reportMonth < currentMonth)) {
      // Create new persistent Report record.
      const persistentReport = new Report(generatedReport);
      // Save it to MongoDB.
      await persistentReport.save();
    }
    
    // Return generated report to client.
    response.json(generatedReport);
  } catch (serviceError) {
    // Send 500 error in case of DB or compute failure.
    response.status(500).json({ id: 'error', message: serviceError.message });
  }
});

/**
 * GET /api/costs
 * Retrieves a full history of all cost transactions.
 * @name list-all-costs
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/costs', async (request, response) => {
  try {
    const globalCosts = await Cost.find({});
    response.json(globalCosts);
  } catch (serviceError) {
    response.status(500).json({ id: 'error', message: serviceError.message });
  }
});

/**
 * GET /api/reports
 * Returns all cached reports stored in the system.
 * @name list-cached-reports
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/reports', async (request, response) => {
  try {
    const allCachedReports = await Report.find({});
    response.json(allCachedReports);
  } catch (serviceError) {
    response.status(500).json({ id: 'error', message: serviceError.message });
  }
});

const PORT = process.env.COSTS_PORT || 3003;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Costs service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
