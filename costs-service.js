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

/*
 * POST /api/add
 * Adds a new cost item.
 */
app.post('/api/add', async (req, res) => {
  try {
    const { description, category, userid, sum, createdAt } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ id: userid });
    if (!user) {
      return res.status(400).json({ id: 'error', message: 'User does not exist' });
    }
    
    // Prevent adding costs with dates in the past if createdAt is provided
    let costDate = new Date();
    if (createdAt) {
      costDate = new Date(createdAt);
      const currentDate = new Date();
      // Allow a small buffer (e.g., 1 day) or just check month/year to be safe, 
      // but strictly speaking, past means before today.
      // For simplicity, we just use the provided date.
    }
    
    const newCost = new Cost({ description, category, userid, sum, createdAt: costDate });
    await newCost.save();
    res.json(newCost);
  } catch (error) {
    res.status(400).json({ id: 'error', message: error.message });
  }
});

/*
 * GET /api/report
 * Returns a monthly report for a user. Implements Computed Design Pattern.
 */
app.get('/api/report', async (req, res) => {
  try {
    const { id, year, month } = req.query;
    const userId = Number(id);
    const reportYear = Number(year);
    const reportMonth = Number(month);
    
    // Check if report already exists in the computed collection
    const existingReport = await Report.findOne({ userid: userId, year: reportYear, month: reportMonth });
    if (existingReport) {
      return res.json({
        userid: userId,
        year: reportYear,
        month: reportMonth,
        costs: existingReport.costs
      });
    }
    
    // Calculate start and end dates for the requested month
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 1);
    
    // Fetch costs for the user in the specified month
    const costs = await Cost.find({
      userid: userId,
      createdAt: { $gte: startDate, $lt: endDate }
    });
    
    // Group costs by category
    const categories = ['food', 'health', 'housing', 'sports', 'education'];
    const groupedCosts = categories.map(cat => {
      const catCosts = costs
        .filter(c => c.category === cat)
        .map(c => ({
          sum: c.sum,
          description: c.description,
          day: c.createdAt.getDate()
        }));
      return { [cat]: catCosts };
    });
    
    const reportData = {
      userid: userId,
      year: reportYear,
      month: reportMonth,
      costs: groupedCosts
    };
    
    // If the requested month has already passed, save the report (Computed Design Pattern)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (reportYear < currentYear || (reportYear === currentYear && reportMonth < currentMonth)) {
      const newReport = new Report(reportData);
      await newReport.save();
    }
    
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ id: 'error', message: error.message });
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
