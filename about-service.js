const express = require('express');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');

const app = express();
app.use(express.json());
app.use(loggerMiddleware);

/*
 * GET /api/about
 * Returns a JSON document describing the team members.
 */
app.get('/api/about', (req, res) => {
  try {
    const teamMembers = [
      { first_name: 'mosh', last_name: 'israeli' }
    ];
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ id: 'error', message: error.message });
  }
});

const PORT = process.env.ABOUT_PORT || 3004;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`About service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
