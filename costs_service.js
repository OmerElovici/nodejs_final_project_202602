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
app.post('/api/add', async (request, response) => {
  try {
    const { description, category, userId, userid, sum, createdAt } = request.body;
    const finalUserId = userId !== undefined ? userId : userid;
    
    const targetUser = await User.findOne({ id: finalUserId });
    if (!targetUser) {
      return response.status(400).json({ id: 'error', message: 'User does not exist' });
    }
    
    let costTimestamp = new Date();
    if (createdAt) {
      costTimestamp = new Date(createdAt);
      const normalizedCurrentDate = new Date();
      normalizedCurrentDate.setHours(0, 0, 0, 0);
      const normalizedCheckDate = new Date(costTimestamp);
      normalizedCheckDate.setHours(0, 0, 0, 0);
      
      // Validation: Prevent backdating costs before today
      if (normalizedCheckDate < normalizedCurrentDate) {
        return response.status(400).json({ id: 'error', message: 'Cannot add costs with dates in the past' });
      }
    }
    
    const newCostEntry = new Cost({ description, category, userId: finalUserId, sum, createdAt: costTimestamp });
    await newCostEntry.save();
    
    response.json(newCostEntry);
  } catch (serviceError) {
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
    const { id, year, month } = request.query;
    const targetUserId = Number(id);
    const reportYear = Number(year);
    const reportMonth = Number(month);
    
    // Check if the report has already been computed and cached
    const cachedReport = await Report.findOne({ userId: targetUserId, year: reportYear, month: reportMonth });
    if (cachedReport) {
      return response.json({
        userId: targetUserId,
        year: reportYear,
        month: reportMonth,
        costs: cachedReport.costs
      });
    }
    
    const startRange = new Date(reportYear, reportMonth - 1, 1);
    const endRange = new Date(reportYear, reportMonth, 1);
    
    const monthlyCosts = await Cost.find({
      userId: targetUserId,
      createdAt: { $gte: startRange, $lt: endRange }
    });
    
    const validCategories = ['food', 'health', 'housing', 'sports', 'education'];
    const categorizedCosts = validCategories.map(currentCategory => {
      const filteredCosts = monthlyCosts
        .filter(costItem => costItem.category === currentCategory)
        .map(costItem => ({
          sum: costItem.sum,
          description: costItem.description,
          day: costItem.createdAt.getDate()
        }));
      return { [currentCategory]: filteredCosts };
    });
    
    const generatedReport = {
      userId: targetUserId,
      year: reportYear,
      month: reportMonth,
      costs: categorizedCosts
    };
    
    // Cache the report if the month is already in the past
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    if (reportYear < currentYear || (reportYear === currentYear && reportMonth < currentMonth)) {
      const persistentReport = new Report(generatedReport);
      await persistentReport.save();
    }
    
    response.json(generatedReport);
  } catch (serviceError) {
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
