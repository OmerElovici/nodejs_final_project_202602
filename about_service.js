const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/**
 * GET /api/about
 * Returns a list of team members who developed the project.
 * @name get-team-details
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/about', (request, response) => {
  try {
    const developmentTeam = [
      { firstName: 'Omer', lastName: 'Elovici' },
      { firstName: 'David', lastName: 'Yakhin' }
    ];
    
    response.json(developmentTeam);
  } catch (serviceError) {
    response.status(500).json({ id: 'error', message: serviceError.message });
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
