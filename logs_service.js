const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');
const Log = require('./models/log');

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/**
 * GET /api/logs
 * Retrieves all application logs from the database.
 * @name list-logs
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response - Express response object.
 */
app.get('/api/logs', async (request, response) => {
  try {
    const allLogEntries = await Log.find({});
    
    response.json(allLogEntries);
  } catch (serviceError) {
    response.status(500).json({ id: 'error', message: serviceError.message });
  }
});

const PORT = process.env.LOGS_PORT || 3001;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Logs service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
